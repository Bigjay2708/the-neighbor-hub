const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { messageLimiter } = require('../utils/rateLimiting');
const { sanitizeUserInput } = require('../utils/security');
const logger = require('../utils/logger');

router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { recipientId: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipientId', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    const conversations = await Promise.all(
      messages.map(async (conversation) => {
        const lastMessage = conversation.lastMessage;
        const participantId = lastMessage.senderId.toString() === req.user.id ? 
          lastMessage.recipientId : lastMessage.senderId;

        const participant = await User.findById(participantId)
          .select('firstName lastName address neighborhood isVerified');

        return {
          _id: conversation._id,
          participant,
          lastMessage: {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId
          },
          unreadCount: conversation.unreadCount
        };
      })
    );

    res.json({ conversations });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const sampleMessage = await Message.findOne({ conversationId });
    if (!sampleMessage || 
        (sampleMessage.senderId.toString() !== userId && 
         sampleMessage.recipientId.toString() !== userId)) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'firstName lastName')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

    await Message.updateMany(
      { 
        conversationId,
        recipientId: userId,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      content: msg.content,
      senderId: msg.senderId._id,
      senderName: `${msg.senderId.firstName} ${msg.senderId.lastName}`,
      createdAt: msg.createdAt,
      isRead: msg.isRead
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/send', [auth, messageLimiter], async (req, res) => {
  try {
    const sanitizedData = sanitizeUserInput(req.body, {
      content: { type: 'text' }
    });

    const { recipientId } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !sanitizedData.content) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const message = new Message({
      senderId,
      recipientId,
      content: sanitizedData.content.trim()
    });

    await message.save();

    await message.populate('senderId', 'firstName lastName');

    const formattedMessage = {
      _id: message._id,
      content: message.content,
      senderId: message.senderId._id,
      senderName: `${message.senderId.firstName} ${message.senderId.lastName}`,
      createdAt: message.createdAt,
      conversationId: message.conversationId
    };

    res.status(201).json({ 
      message: formattedMessage,
      success: true 
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/conversations/:conversationId/read', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      { 
        conversationId,
        recipientId: userId,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ success: true });
  } catch (error) {
    logger.error('Error marking conversation as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      recipientId: userId,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    logger.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
