// backend/routes/textbooks.js
const express = require('express');
const router = express.Router();
const Textbook = require('../models/Textbook');
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
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, price, condition, description, images, sellerId } = req.body;
    const textbook = new Textbook({ title, author, isbn, price, condition, description, images, seller: sellerId });
    await textbook.save();
    res.status(201).json(textbook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
