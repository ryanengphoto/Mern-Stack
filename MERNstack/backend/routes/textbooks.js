// backend/routes/textbooks.js
const express = require('express');
const router = express.Router();
const Textbook = require('../models/Textbook');
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET all textbooks with seller info
router.get('/', async (req, res) => {
  try {
    const textbooks = await Textbook.find().populate('seller', 'name email phone');
    res.json(textbooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET textbooks by a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const textbooks = await Textbook.find({ seller: req.params.userId });
    res.json(textbooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new textbook
router.post('/', auth, async (req, res) => {
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

//search textbooks API call
app.post('/search', async (req, res) =>
{
  try
  {
    const {search} = req.body;

    //clean search
    const searchTrimmed = search.trim();

    //get textbooks matching search
    const matchedTextbooks = await Textbook.find({title: {$regex: searchTrimmed, $options: 'i'}});
    const result = matchedTextbooks.map(t => ({id: t._id, title: t.title, author: t.author, price: t.price, isbn: t.isbn, seller: t.seller}));

    res.status(200).json({results: result, error: ''});
  }
  catch (e)
  {
    console.error(e);
    res.status(500).json({error: e.toString()});
  }
});

module.exports = router;
