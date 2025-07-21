const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('js  } catch (error) {
    logger.error('Registration error:', {
      } catch (error) {
    logger.error('Login error:', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ error: 'Server error during login' });
  }ror: error.message,
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ error: 'Server error during registration' });
  }btoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Neighborhood = require('../models/Neighborhood');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../utils/rateLimiting');
const { sanitizeUserInput } = require('../utils/security');
const logger = require('../utils/logger');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

router.post('/register', [
  authLimiter,
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
      email: { type: 'text' },
      zipCode: { type: 'text' }
    });

    const { password, address } = req.body;

    const existingUser = await User.findOne({ email: sanitizedData.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const neighborhood = await Neighborhood.findOne({ zipCodes: sanitizedData.zipCode });
    if (!neighborhood) {
      return res.status(400).json({ message: 'No neighborhood found for this zip code' });
    }

    const user = new User({
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      email: sanitizedData.email,
      password,
      address: {
        ...address,
        zipCode: sanitizedData.zipCode
      },
      neighborhoodId: neighborhood._id
    });

    await user.save();

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
  authLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedData = sanitizeUserInput(req.body, {
      email: { type: 'text' }
    });

    const { password } = req.body;

    const user = await User.findOne({ email: sanitizedData.email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    await user.updateLastActive();

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
        neighborhoodId: user.neighborhoodId,
        avatar: user.avatar
      }
    });

  } catch (error) {
    logger.error('Login error:', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('neighborhoodId', 'name')
      .select('-password');

    res.json({ user });
  } catch (error) {
    logger.error('Get user error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-email', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { 
      isVerified: true,
      verificationMethod: 'email'
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/change-password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
