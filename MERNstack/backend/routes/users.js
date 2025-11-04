// backend/routes/users.js
const express = require('express');
const crypto = require('crypto'); // sendmailer functions
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

    const exisitingUser = await User.findOne({ email });
    if (exisitingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    const newUser = new User({
      name,
      email,
      password,
      phone,
      address,
      balance: 100,
      verificationToken,
      verificationExpires,
      verified: false
    })
    
    await newUser.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify/${verificationToken}`;
    await sendVerificationEmail(email, verifyUrl);

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      verified: newUser.verified
    };

    res.status(201).json({
      message: 'User created. Please check your email to verify your account.',
      user: userResponse
    });
  } catch (err) {
    console.error('User creation error:', err);
    res.status(400).json({ error: err.message });
  }
});

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
 * @desc Adds $100 to user's balance
 * @route POST /api/users/addBalance
 * @access Protected
 * */
router.post('/addBalance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({error: 'User not found'});

    user.balance += 100;
    await user.save();

    res.status(200).json({
      message: 'Balance was updated successfully'
    });
  }
  catch (err) {
    res.status(400).json({error: err.message});
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

module.exports = router;
