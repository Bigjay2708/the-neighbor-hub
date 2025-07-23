const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Add the backend directory to the require path
const backendPath = path.join(__dirname, '..', 'backend');

const authRoutes = require(path.join(backendPath, 'routes', 'auth'));
const userRoutes = require(path.join(backendPath, 'routes', 'users'));
const forumRoutes = require(path.join(backendPath, 'routes', 'forum'));
const marketplaceRoutes = require(path.join(backendPath, 'routes', 'marketplace'));
const safetyRoutes = require(path.join(backendPath, 'routes', 'safety'));
const messageRoutes = require(path.join(backendPath, 'routes', 'messages'));
const uploadRoutes = require(path.join(backendPath, 'routes', 'upload'));

const app = express();

// Simple logging function for serverless
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

try {
  // Middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'https://neighbor-7ecgt15tm-bigjays-projects.vercel.app'
      : 'http://localhost:3000',
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // MongoDB connection
  if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(() => {
      log.info('Connected to MongoDB');
    }).catch((err) => {
      log.error('MongoDB connection error: ' + err.message);
    });
  }

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/forum', forumRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/safety', safetyRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/upload', uploadRoutes);

} catch (error) {
  log.error('Error setting up app: ' + error.message);
}

// Health check with MongoDB connection status
app.get('/api/health', async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({ 
      status: 'OK', 
      message: 'API is running',
      mongodb: statusMap[mongoStatus] || 'unknown',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  log.error('Error: ' + err.message);
  res.status(err.status || 500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

module.exports = app;
