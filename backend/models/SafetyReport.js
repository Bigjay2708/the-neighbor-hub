const mongoose = require('mongoose');

const safetyReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['crime', 'suspicious-activity', 'lost-pet', 'found-pet', 'weather-alert', 'road-closure', 'utility-outage', 'emergency', 'other']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    address: {
      type: String,
      required: [true, 'Location is required']
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  reporterId: {
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
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'investigating', 'false-alarm'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  acknowledgedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  incidentDateTime: {
    type: Date,
    required: [true, 'Incident date and time is required']
  },
  policeReported: {
    type: Boolean,
    default: false
  },
  policeReportNumber: String,
  contactInfo: {
    phone: String,
    email: String,
    preferredContact: {
      type: String,
      enum: ['phone', 'email', 'app'],
      default: 'app'
    }
  }
}, {
  timestamps: true
});

safetyReportSchema.index({ neighborhoodId: 1, type: 1, createdAt: -1 });
safetyReportSchema.index({ 'location.coordinates': '2dsphere' });
safetyReportSchema.index({ severity: 1 });
safetyReportSchema.index({ status: 1 });
safetyReportSchema.index({ incidentDateTime: -1 });

module.exports = mongoose.model('SafetyReport', safetyReportSchema);
