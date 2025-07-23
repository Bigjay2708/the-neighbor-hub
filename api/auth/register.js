const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedConnection = connection;
  return connection;
}

// Simple user schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  zipCode: { type: String, required: true },
  neighborhoodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Neighborhood' },
  role: { type: String, default: 'resident' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Simple neighborhood schema
const NeighborhoodSchema = new mongoose.Schema({
  zipCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  stats: {
    totalMembers: { type: Number, default: 0 },
    activeDiscussions: { type: Number, default: 0 },
    helpfulNeighbors: { type: Number, default: 0 },
    communityEvents: { type: Number, default: 0 }
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Neighborhood = mongoose.models.Neighborhood || mongoose.model('Neighborhood', NeighborhoodSchema);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const { firstName, lastName, email, password, zipCode } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !zipCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Find or create neighborhood
    let neighborhood = await Neighborhood.findOne({ zipCode });
    if (!neighborhood) {
      neighborhood = new Neighborhood({
        zipCode,
        name: `${zipCode} Community`,
        description: `Neighborhood community for ${zipCode}`,
        stats: {
          totalMembers: 0,
          activeDiscussions: 0,
          helpfulNeighbors: 0,
          communityEvents: 0
        }
      });
      await neighborhood.save();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      neighborhoodId: neighborhood._id,
      zipCode,
      role: 'resident',
      isVerified: false
    });

    await user.save();

    // Update neighborhood stats
    await Neighborhood.findByIdAndUpdate(neighborhood._id, {
      $inc: { 'stats.totalMembers': 1 }
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

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
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
