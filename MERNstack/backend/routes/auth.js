const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailService');
const CLIENT_URL = 'http://lamp-stack4331.xyz';

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    const user = new User({ 
      name, 
      email, 
      password, 
      phone, 
      verificationToken, 
      verificationExpires, 
      verified: false 
    });
    await user.save();

    const verifyUrl = `${CLIENT_URL}/verify/${verificationToken}`;
    await sendVerificationEmail(email, verifyUrl);
    
    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// VERIFY EMAIL
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      // Redirect to frontend with error
      return res.redirect(`${CLIENT_URL}/verify-result?success=false&message=Invalid or expired token`);
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Redirect to frontend with success
    res.redirect(`${CLIENT_URL}/verify-result?success=true&message=Email verified successfully`);
  } catch (err) {
    console.error('Verification error:', err);
    res.redirect(`${CLIENT_URL}/verify-result?success=false&message=Server error`);
  }
});

// RESEND VERIFICATION EMAIL
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    const verifyUrl = `${CLIENT_URL}/verify/${verificationToken}`;
    await sendVerificationEmail(email, verifyUrl);

    res.json({ message: 'Verification email resent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in',
        needsVerification: true 
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Don't send password back
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      verified: user.verified
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;