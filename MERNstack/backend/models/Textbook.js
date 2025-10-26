// backend/models/Textbook.js
const mongoose = require('mongoose');

const textbookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  isbn: String,
  price: { type: Number, required: true },
  condition: { type: String, enum: ['new', 'like new', 'used', 'very used'], default: 'used' },
  description: { type: String, default: '' },
  images: [String], // array of image URLs
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer: {type: String, default: ''},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Textbook', textbookSchema);
