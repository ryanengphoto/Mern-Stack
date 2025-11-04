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
    const { title, author, isbn, price, condition, description, images } = req.body;

    const textbook = new Textbook({
      title,
      author,
      isbn,
      price,
      condition,
      description,
      images,
      seller: req.user._id   // <- automatically tied to logged-in user
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
router.post('/search', async (req, res) =>
{
  try 
  {
    const {search} = req.body;

    //clean search
    const searchTrimmed = search.trim();

    //get textbooks matching search
    const matchedTextbooks = await Textbook.find({title: {$regex: searchTrimmed, $options: 'i'}});
    const result = matchedTextbooks.map(t => ({id: t._id, title: t.title, author: t.author, price: t.price, isbn: t.isbn, seller: t.seller, buyer: t.buyer}));

    res.status(200).json({results: result, error: ''});
  }
  catch (e)
  {
    console.error(e);
    res.status(500).json({error: e.toString()});
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
  try {
    const { id } = req.body;
    const buyerId = req.user._id;

    const textbookToBuy = await Textbook.findById(id).populate('seller', 'name email phone');
    
    if (!textbookToBuy) return res.status(404).json({error: "No textbook found"});
    
    const buyer = await User.findById(buyerId);
    const seller = await User.findById(textbookToBuy.seller._id);

    if (textbookToBuy.price > buyer.balance) return res.status(404).json({error: "User doesn't have enough money"});

    if (textbookToBuy.seller._id.toString() === buyerId.toString())
    {
      return res.status(400).json({error: "This is your own textbook"});
    }

    textbookToBuy.buyer = buyerId
    await textbookToBuy.save();

    //update balances
    buyer.balance -= textbookToBuy.price;
    await buyer.save();
    seller.balance += textbookToBuy.price;
    await seller.save();

    res.status(200).json({ message: 'Textbook purchased successfully' });
  } catch (err) {
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
