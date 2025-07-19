const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Messages route working' });
});

// Get all conversations for a user
router.get('/conversations', auth, async (req, res) => {
  try {
    res.json({ conversations: [] });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
