const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailService');
const PasswordResetToken = require('../models/PasswordReset');
const CLIENT_URL = 'https://lamp-stack4331.xyz';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    const verifyUrl = `${CLIENT_URL}/api/auth/verify/${verificationToken}`;
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
      verified: user.verified,
      balance: user.balance
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with that email'});

    const token = crypto.randomBytes(32).toString('hex');
    await PasswordResetToken.create({ userId: user._id, token });

    const resetLink = `https://lamp-stack4331.xyz/reset-password/${token}`;

    const msg = {
      to: email,
      from: 'no-reply@lamp-stack4331.xyz',
      subject: 'Reset your Papyrus password!',
      html: `
        <h2>Password Reset</h2>
        <p>Hello ${user.name || ''},</p>
        <p>Click the link below to reset your password.</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 30 minutes.</p>
      `
    };

    await sgMail.send(msg);
    res.json({ message: 'Password reset link sent'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetToken = await PasswordResetToken.findOne({ token });
    if (!resetToken) return res.status(400).json({ error: 'Invalid or expired token.' });

    const user = await User.findById(resetToken.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.password = password; // <--- just assign plain password
    await user.save();        // pre-save hook hashes it automatically
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    res.json({ message: 'Password successfully reset.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
