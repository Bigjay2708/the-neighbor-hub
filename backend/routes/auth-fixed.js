const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Neighborhood = require('../models/Neighborhood');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Simple rate limiting for serverless
const requests = new Map();
const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  if (!requests.has(ip)) {
    requests.set(ip, []);
  }
  
  const userRequests = requests.get(ip);
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= 5) {
    return res.status(429).json({ message: 'Too many requests' });
  }
  
  recentRequests.push(now);
  requests.set(ip, recentRequests);
  next();
};

// Simple input sanitization
const sanitizeUserInput = (data, rules) => {
  const sanitized = {};
  Object.keys(rules).forEach(key => {
    if (data[key]) {
      sanitized[key] = data[key].toString().trim();
    }
  });
  return sanitized;
};

router.post('/register', [
  rateLimit,
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('zipCode').notEmpty().withMessage('Zip code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedData = sanitizeUserInput(req.body, {
      firstName: { type: 'text' },
      lastName: { type: 'text' },
      email: { type: 'email' },
      zipCode: { type: 'text' }
    });

    const { firstName, lastName, email, password, zipCode } = sanitizedData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Find or create neighborhood
    let neighborhood = await Neighborhood.findOne({ zipCode });
    if (!neighborhood) {
      neighborhood = new Neighborhood({
        zipCode,
        name: `${zipCode} Community`,
        description: `Neighborhood community for ${zipCode}`,
        stats: {
          totalMembers: 0,
          activeDiscussions: 0,
          helpfulNeighbors: 0,
          communityEvents: 0
        }
      });
      await neighborhood.save();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      neighborhoodId: neighborhood._id,
      zipCode,
      role: 'resident',
      isVerified: false
    });

    await user.save();

    // Update neighborhood stats
    await Neighborhood.findByIdAndUpdate(neighborhood._id, {
      $inc: { 'stats.totalMembers': 1 }
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        neighborhoodId: user.neighborhoodId
      }
    });

  } catch (error) {
    logger.error('Registration error:', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', [
  rateLimit,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).populate('neighborhoodId');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        neighborhoodId: user.neighborhoodId
      }
    });

  } catch (error) {
    logger.error('Login error:', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('neighborhoodId');
    res.json(user);
  } catch (error) {
    logger.error('Get user error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/verify-email', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isVerified: true });
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });
    res.status(500).json({ error: 'Server error during email verification' });
  }
});

router.post('/change-password', [
  auth,
  rateLimit,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });
    res.status(500).json({ error: 'Server error during password change' });
  }
});

module.exports = router;
