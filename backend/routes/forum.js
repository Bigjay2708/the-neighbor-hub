const express = require('express');
const { body, validationResult } = require('express-validator');
const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');
const { auth, verifiedOnly, moderatorOrAdmin } = require('../middleware/auth');
const { sanitizeUserInput } = require('../utils/security');
const { uploadMultiple, handleUploadError, processUploadedFiles } = require('../utils/upload');
const { postCreationLimiter } = require('../utils/rateLimiting');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/posts', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      tags, 
      sortBy = 'lastActivity',
      search 
    } = req.query;

    const query = { 
      neighborhoodId: req.user.neighborhoodId,
      isModerated: false 
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'mostLiked':
        sortOptions = { 'likes.length': -1 };
        break;
      case 'mostViewed':
        sortOptions = { views: -1 };
        break;
      default:
        sortOptions = { isSticky: -1, lastActivity: -1 };
    }

    const posts = await ForumPost.find(query)
      .populate('authorId', 'firstName lastName avatar role isVerified')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const postsWithCommentCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ postId: post._id });
        return { ...post, commentCount };
      })
    );

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts: postsWithCommentCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    logger.error('Get forum posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/posts/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('authorId', 'firstName lastName avatar role isVerified');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.neighborhoodId.toString() !== req.user.neighborhoodId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await ForumPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const comments = await Comment.find({ postId: req.params.id })
      .populate('authorId', 'firstName lastName avatar role isVerified')
      .sort({ createdAt: 1 });

    const commentMap = {};
    const topLevelComments = [];

    comments.forEach(comment => {
      comment.replies = [];
      commentMap[comment._id] = comment;

      if (comment.parentCommentId) {
        if (commentMap[comment.parentCommentId]) {
          commentMap[comment.parentCommentId].replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    });

    res.json({
      post,
      comments: topLevelComments
    });

  } catch (error) {
    logger.error('Get forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/posts', [
  auth,
  verifiedOnly,
  postCreationLimiter,
  uploadMultiple,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isIn(['general', 'events', 'pets', 'recommendations', 'lost-found', 'announcements', 'questions', 'services']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedData = sanitizeUserInput(req.body, {
      title: { type: 'text' },
      content: { type: 'html' },
      category: { type: 'text' }
    });

    const uploadedImages = processUploadedFiles(req.files);

    const post = new ForumPost({
      title: sanitizedData.title,
      content: sanitizedData.content,
      category: sanitizedData.category,
      tags: req.body.tags || [],
      images: uploadedImages,
      authorId: req.user.id,
      neighborhoodId: req.user.neighborhoodId
    });

    await post.save();

    const populatedPost = await ForumPost.findById(post._id)
      .populate('authorId', 'firstName lastName avatar role isVerified');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });

  } catch (error) {
    logger.error('Create forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/posts/:id', [
  auth,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, content, tags, isSolved } = req.body;

    const updatedPost = await ForumPost.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags }),
        ...(isSolved !== undefined && { isSolved }),
        lastActivity: new Date()
      },
      { new: true }
    ).populate('authorId', 'firstName lastName avatar role isVerified');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    logger.error('Update forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = post.likes.find(like => like.userId.toString() === req.user.id);

    if (existingLike) {
      post.likes = post.likes.filter(like => like.userId.toString() !== req.user.id);
    } else {
      post.likes.push({ userId: req.user.id });
    }

    await post.save();
    await post.updateActivity();

    res.json({
      message: existingLike ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: !existingLike
    });

  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/posts/:id/comments', [
  auth,
  body('content').trim().notEmpty().withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedData = sanitizeUserInput(req.body, {
      content: { type: 'html' }
    });

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content: sanitizedData.content,
      authorId: req.user.id,
      postId: req.params.id,
      parentCommentId: req.body.parentCommentId || null
    });

    await comment.save();
    await post.updateActivity();

    const populatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'firstName lastName avatar role isVerified');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: populatedComment
    });

  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Comment.deleteMany({ postId: req.params.id });

    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.use(handleUploadError);

module.exports = router;
