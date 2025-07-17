const mongoose = require('mongoose');

const marketplaceListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['furniture', 'electronics', 'clothing', 'books', 'toys', 'tools', 'appliances', 'vehicles', 'services', 'other']
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceType: {
    type: String,
    enum: ['fixed', 'negotiable', 'free', 'trade'],
    default: 'fixed'
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  neighborhoodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Neighborhood',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'removed'],
    default: 'available'
  },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    favoritedAt: {
      type: Date,
      default: Date.now
    }
  }],
  flags: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'scam', 'duplicate', 'other']
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  lastBumped: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
marketplaceListingSchema.index({ neighborhoodId: 1, category: 1, status: 1, createdAt: -1 });
marketplaceListingSchema.index({ sellerId: 1 });
marketplaceListingSchema.index({ tags: 1 });
marketplaceListingSchema.index({ price: 1 });
marketplaceListingSchema.index({ 'location.coordinates': '2dsphere' });

// Automatically expire listings
marketplaceListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
