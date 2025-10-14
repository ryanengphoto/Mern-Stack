// === Imports ===
const express = require('express');
const cors = require('cors');
const User = require('./models/User');
require('dotenv').config();
const mongoose = require('mongoose');

// connect using mongoose
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected via Mongoose'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// === Express setup ===
const app = express();

app.use(cors());
app.use(express.json());

// === Routes ===

// test route
app.get('/api/ping', (req, res) => {
  console.log('Received /api/ping request');
  res.status(200).json({ message: 'Hello World' });
});

app.use('/api/textbooks', require('./routes/textbooks'));

// example route to test MongoDB write
app.post('/api/user', async (req, res) => {
  try {
    const { name, email, balance } = req.body;
    const newUser = new User({ name, email, balance });
    await newUser.save();
    res.status(201).json({ message: 'User saved', data: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// example route to fetch users
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// CORS headers (redundant if using app.use(cors()), but can stay)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

// fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// === Server start ===
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
