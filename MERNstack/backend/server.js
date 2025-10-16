// === Imports ===
const express = require('express');
const cors = require('cors');
const User = require('./models/User');
const Textbook = require('./models/Textbook');
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

//add textbook API call
app.post('/api/addtextbook', async (req, res) =>
{
  try
  {
    const { userId, title, price, } = req.body;
    const newTextbook = new Textbook({title: title, seller: userId, price: price});
    await newTextbook.save();
    res.status(200).json("Textbook added");
  }
  catch(e)
  {
    console.error(e);
    res.status(500).json({error: e.toString()});
  }
});

//login API call
app.post('/api/login', async (req, res) =>
{
  try
  {
    const { email, password } = req.body;
    const user = await User.findOne({email});
    
    //check if user exists
    if (user == null)
      return res.status(401).json({id: -1, error: "Invalid login"});

    //check password
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (passwordCheck == false)
      return res.status(401).json({id: -1, error: "Invalid login"});

    res.status(200).json({id: user._id, name: user.name, email: user.email, error: ''});
  }
  catch (e)
  {
    console.error(e);
    res.status(500).json({error: e.toString()});
  }
});

//search textbooks API call
app.post('/api/searchtextbooks', async (req, res) =>
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

// 404 Error -- For debuggin'
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// run server
const PORT = process.env.PORT || 5001; //note: port 5000 is already taken for Mac
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));