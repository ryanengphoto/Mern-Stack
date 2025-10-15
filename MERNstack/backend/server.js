const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://group9_db_user:KItFHkh4PritDTRh@cluster0.adjzkdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(url);
client.connect();

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
app.use('/api/textbooks', require('./routes/textbooks'));


  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    email,
    password,
    name
  };

  users.push(newUser);
  const token = generateToken(newUser.id);

  res.status(201).json({
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
    token
  });

app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = users.find(u => u.id === decoded.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ id: user.id, email: user.email, name: user.name });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ message: 'Password reset email sent (mock)' });
});

// Product Routes
app.get('/api/products', (req, res) => {
  res.json(textbooks);
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: textbooks.length + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  textbooks.push(newProduct);
  res.status(201).json(newProduct);
});

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

//add textbook API call
app.post('/api/addtextbook', async (req, res, next) =>
{
  // incoming: userId, color
  // outgoing: error
  const { userId, textbook } = req.body;
  const newTextbook = {Textbook:textbook,UserId:userId};
  var error = '';

  try
  {
    const db = client.db('COP4331Textbooks');
    const result = db.collection('Textbooks').insertOne(newTextbook);
  }
  catch(e)
  {
    error = e.toString();
  }

  textbookList.push( textbook );
  var ret = { error: error };
  res.status(200).json(ret);
});

//login API call
app.post('/api/login', async (req, res, next) =>
{
  // incoming: login, password
  // outgoing: id, firstName, lastName, error
  var error = '';
  const { login, password } = req.body;
  const db = client.db('COP4331Textbooks');
  const results = await db.collection('Users').find({Login:login,Password:password}).toArray();
  
  var id = -1;
  var fn = '';
  var ln = '';

  if( results.length > 0 )
  {
    id = results[0].UserID;
    fn = results[0].FirstName;
    ln = results[0].LastName;
  }

  var ret = { id:id, firstName:fn, lastName:ln, error:''};
  res.status(200).json(ret);
});

//search textbooks API call
app.post('/api/searchtextbooks', async (req, res, next) =>
{
  // incoming: userId, search
  // outgoing: results[], error
  var error = '';
  const { userId, search } = req.body;
  var _search = search.trim();
  const db = client.db('COP4331Textbooks');
  const results = await db.collection('Textbooks').find({"Textbook":{$regex:_search+'.*', $options:'i'}}).toArray();
  var _ret = [];

  for( var i=0; i<results.length; i++ )
  {
    _ret.push( results[i].Textbook );
  }

  var ret = {results:_ret, error:error};
  res.status(200).json(ret);
});


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


// for debuggin'
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// run server
const PORT = process.env.PORT || 5001; //note: port 5000 is already taken for Mac
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
