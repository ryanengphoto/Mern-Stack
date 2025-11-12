// backend/routes/textbooks.js
const express = require('express');
const router = express.Router();
const Textbook = require('../models/Textbook');
const auth = require('../middleware/auth');
const User = require('../models/User');

/**
 * @desc Get ALL textbooks w/ seller info
 * @route POST /api/textbooks/all
 */
router.post('/all', async (req, res) => {
  try {
    const textbooks = await Textbook.find().populate('seller', 'name email phone');
    res.status(200).json({ textbooks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @desc Get textbooks by a specific user
 * @route POST /api/textbooks/by-user
 * @body { userId: string }
 */
router.post('/by-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const textbooks = await Textbook.find({ seller: userId });
    res.status(200).json({ textbooks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @desc Create a new textbook (protected)
 * @route POST /api/textbooks/add
 */
router.post('/add', auth, async (req, res) => {
  try {
    const { title, author, isbn, price, condition, description, images, category } = req.body;

    const textbook = new Textbook({
      title,
      author,
      isbn,
      price,
      condition,
      description,
      images,
      category,           // <-- added category here
      seller: req.user._id
    });

    await textbook.save();
    res.status(201).json(textbook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @desc Search textbooks
 * @route POST /api/textbooks/search
 * @body { search: string }
 */
router.post('/search', async (req, res) => {
  try {
    const { search } = req.body;
    const searchTrimmed = search.trim();

    const matchedTextbooks = await Textbook.find({ title: { $regex: searchTrimmed, $options: 'i' } });
    const result = matchedTextbooks.map(t => ({
      id: t._id,
      title: t.title,
      author: t.author,
      price: t.price,
      isbn: t.isbn,
      seller: t.seller,
      buyer: t.buyer,
      category: t.category  // <-- include category in search results
    }));

    res.status(200).json({ results: result, error: '' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.toString() });
  }
});

/**
 * @desc Update textbook info (protected)
 * @route POST /api/textbooks/update
 * @body { id: string, fieldsToUpdate: object }
 */
router.post('/update', auth, async (req, res) => {
  try {
    const { id, ...updates } = req.body;

    const updated = await Textbook.findOneAndUpdate(
      { _id: id, seller: req.user._id },
      updates,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Textbook not found or unauthorized' });

    res.status(200).json({ message: 'Textbook updated', textbook: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @desc Purchase textbook (protected)
 * @route POST /api/textbooks/purchase
 * @body { id: string }
 */
router.post('/purchase', auth, async (req, res) => {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    const { id } = req.body;
    const buyerId = req.user._id;

    const textbookToBuy = await Textbook.findById(id).populate('seller', 'name email phone');
    if (!textbookToBuy) return res.status(404).json({ error: "No textbook found" });

    const buyer = await User.findById(buyerId);
    const seller = await User.findById(textbookToBuy.seller._id);

    if (textbookToBuy.price > buyer.balance)
      return res.status(400).json({ error: "User doesn't have enough money" });

    if (textbookToBuy.seller._id.toString() === buyerId.toString()) {
      return res.status(400).json({ error: "This is your own textbook" });
    }

    // --- Transaction Logic ---
    textbookToBuy.buyer = buyerId;
    await textbookToBuy.save();

    buyer.balance -= textbookToBuy.price;
    await buyer.save();

    seller.balance += textbookToBuy.price;
    await seller.save();

    // --- Email Confirmation ---
    const buyerMsg = {
      to: buyer.email,
      from: 'no-reply@lamp-stack4331.xyz',
      subject: `Purchase Confirmation: ${textbookToBuy.title}`,
      html: `
        <h2>Purchase Successful!</h2>
        <p>Hey ${buyer.name || "there"},</p>
        <p>You just bought <strong>${textbookToBuy.title}</strong> from ${seller.name} for $${textbookToBuy.price}.</p>
        <p>Seller Contact:</p>
        <ul>
          <li>Email: ${seller.email}</li>
          ${seller.phone ? `<li>Phone: ${seller.phone}</li>` : ""}
        </ul>
        <p>Thank you for using <strong>Papyrus</strong>!</p>
      `
    };

    const sellerMsg = {
      to: seller.email,
      from: 'no-reply@lamp-stack4331.xyz',
      subject: `Your Textbook Was Sold: ${textbookToBuy.title}`,
      html: `
        <h2>Good news, ${seller.name || "Seller"}!</h2>
        <p>Your textbook <strong>${textbookToBuy.title}</strong> has been purchased by ${buyer.name} for $${textbookToBuy.price}.</p>
        <p>Buyer Contact:</p>
        <ul>
          <li>Email: ${buyer.email}</li>
          ${buyer.phone ? `<li>Phone: ${buyer.phone}</li>` : ""}
        </ul>
        <p>Your balance has been updated. You can check your account on Papyrus for details.</p>
      `
    };

    await Promise.all([
      sgMail.send(buyerMsg),
      sgMail.send(sellerMsg)
    ]);

    res.status(200).json({ message: 'Textbook purchased successfully and confirmation emails sent.' });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * @desc Delete textbook (protected)
 * @route POST /api/textbooks/delete
 * @body { id: string }
 */
router.post('/delete', auth, async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await Textbook.findOneAndDelete({ _id: id, seller: req.user._id });
    if (!deleted) return res.status(404).json({ error: 'Textbook not found or unauthorized' });

    res.status(200).json({ message: 'Textbook deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
