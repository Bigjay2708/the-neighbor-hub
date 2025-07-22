const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('../backend/routes/auth');
const userRoutes = require('../backend/routes/users');
const forumRoutes = require('../backend/routes/forum');
const marketplaceRoutes = require('../backend/routes/marketplace');
const safetyRoutes = require('../backend/routes/safety');
const messageRoutes = require('../backend/routes/messages');
const uploadRoutes = require('../backend/routes/upload');

const app = express();

// Simple logging function for serverless
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`)
};

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://neighbor-qunh1vmbx-bigjays-projects.vercel.app'
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
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
