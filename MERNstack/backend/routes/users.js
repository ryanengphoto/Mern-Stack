<<<<<<< HEAD
// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

/**
 * @desc Create a new user (signup)
 * @route POST /api/users/add
 * @access Public
 */
router.post('/add', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // prevent dupes
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const user = new User({ name, email, password, phone, address });
    await user.save();

    res.status(201).json(user);
=======
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const newUser = new User({ name, email, password, phone, address });
    await newUser.save();
    res.status(201).json(newUser);
>>>>>>> 137f65e (create post routes)
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

<<<<<<< HEAD
/**
 * @desc Get all users
 * @route POST /api/users/all
 * @access Protected (ideally admin-only)
 */
router.post('/all', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @desc Get logged-in user's info
 * @route POST /api/users/me
 * @access Protected
 */
router.post('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @desc Update logged-in user's info
 * @route POST /api/users/update
 * @access Protected
 */
router.post('/update', auth, async (req, res) => {
  try {
    const updates = { ...req.body };

    // hash password if it’s being changed
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User updated', user: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @desc Delete logged-in user's account
 * @route POST /api/users/delete
 * @access Protected
 */
router.post('/delete', auth, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.user._id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

=======
>>>>>>> 137f65e (create post routes)
module.exports = router;
