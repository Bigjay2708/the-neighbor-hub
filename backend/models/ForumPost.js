const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['general', 'events', 'pets', 'recommendations', 'lost-found', 'announcements', 'questions', 'services']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  neighborhoodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Neighborhood',
    required: true
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isSticky: {
    type: Boolean,
    default: false
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationReason: String,
  flags: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'other']
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
forumPostSchema.index({ neighborhoodId: 1, category: 1, createdAt: -1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ lastActivity: -1 });

// Update lastActivity when post is interacted with
forumPostSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('ForumPost', forumPostSchema);
