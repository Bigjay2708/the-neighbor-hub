const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('neighborhoodId', 'name description')
      .select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['firstName', 'lastName', 'bio', 'avatar', 'skills', 'preferences'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).populate('neighborhoodId', 'name description');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/neighbors
// @desc    Get neighbors in the same neighborhood
// @access  Private
router.get('/neighbors', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const query = { 
      neighborhoodId: req.user.neighborhoodId,
      _id: { $ne: req.user.id } // Exclude current user
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const neighbors = await User.find(query)
      .select('firstName lastName avatar bio role isVerified skills lastActive joinedAt')
      .sort({ lastActive: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      neighbors,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get neighbors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/neighbors/:id
// @desc    Get neighbor profile
// @access  Private
router.get('/neighbors/:id', auth, async (req, res) => {
  try {
    const neighbor = await User.findById(req.params.id)
      .select('firstName lastName avatar bio role isVerified skills lastActive joinedAt badges')
      .populate('neighborhoodId', 'name');

    if (!neighbor) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is in the same neighborhood
    if (neighbor.neighborhoodId._id.toString() !== req.user.neighborhoodId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ neighbor });

  } catch (error) {
    console.error('Get neighbor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', auth, async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/add-skill
// @desc    Add skill to user profile
// @access  Private
router.post('/add-skill', [
  auth,
  body('skill').trim().notEmpty().withMessage('Skill is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skill } = req.body;

    const user = await User.findById(req.user.id);

    if (user.skills.includes(skill.toLowerCase())) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    user.skills.push(skill.toLowerCase());
    await user.save();

    res.json({
      message: 'Skill added successfully',
      skills: user.skills
    });

  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/remove-skill/:skill
// @desc    Remove skill from user profile
// @access  Private
router.delete('/remove-skill/:skill', auth, async (req, res) => {
  try {
    const { skill } = req.params;

    const user = await User.findById(req.user.id);

    user.skills = user.skills.filter(s => s !== skill.toLowerCase());
    await user.save();

    res.json({
      message: 'Skill removed successfully',
      skills: user.skills
    });

  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/activity-stats
// @desc    Get user's activity statistics
// @access  Private
router.get('/activity-stats', auth, async (req, res) => {
  try {
    const ForumPost = require('../models/ForumPost');
    const Comment = require('../models/Comment');
    const MarketplaceListing = require('../models/MarketplaceListing');
    const SafetyReport = require('../models/SafetyReport');

    const [forumPosts, comments, listings, safetyReports] = await Promise.all([
      ForumPost.countDocuments({ authorId: req.user.id }),
      Comment.countDocuments({ authorId: req.user.id }),
      MarketplaceListing.countDocuments({ sellerId: req.user.id }),
      SafetyReport.countDocuments({ reporterId: req.user.id })
    ]);

    res.json({
      forumPosts,
      comments,
      marketplaceListings: listings,
      safetyReports,
      joinedDate: req.user.joinedAt,
      lastActive: req.user.lastActive
    });

  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes

// @route   GET /api/users/admin/all
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/admin/all', [auth, adminOnly], async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, neighborhood, verified } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (neighborhood) {
      query.neighborhoodId = neighborhood;
    }

    if (verified === 'true') {
      query.isVerified = true;
    } else if (verified === 'false') {
      query.isVerified = false;
    }

    const users = await User.find(query)
      .populate('neighborhoodId', 'name')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/admin/:id/role
// @desc    Update user role (admin only)
// @access  Private/Admin
router.put('/admin/:id/role', [
  auth,
  adminOnly,
  body('role').isIn(['resident', 'admin', 'moderator', 'business']).withMessage('Valid role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
