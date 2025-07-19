const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create conversation ID from sender and recipient IDs (sorted for consistency)
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    const ids = [this.senderId.toString(), this.recipientId.toString()].sort();
    this.conversationId = ids.join('_');
  }
  next();
});

// Index for efficient conversation queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, recipientId: 1 });

module.exports = mongoose.model('Message', messageSchema);
