const mongoose = require('mongoose');

const neighborhoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Neighborhood name is required'],
    trim: true,
    maxlength: [100, 'Neighborhood name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  zipCodes: [{
    type: String,
    required: true
  }],
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays for polygon coordinates
      required: true
    }
  },
  adminIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderatorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    requireVerification: { type: Boolean, default: true },
    allowBusinessListings: { type: Boolean, default: true },
    moderateAllPosts: { type: Boolean, default: false },
    maxPostsPerDay: { type: Number, default: 10 }
  },
  stats: {
    totalMembers: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    totalListings: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

neighborhoodSchema.index({ boundaries: '2dsphere' });

module.exports = mongoose.model('Neighborhood', neighborhoodSchema);
