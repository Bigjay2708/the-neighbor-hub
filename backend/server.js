const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const logger = require('./utils/logger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const forumRoutes = require('./routes/forum');
const marketplaceRoutes = require('./routes/marketplace');
const safetyRoutes = require('./routes/safety');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('MongoDB Connected'))
.catch(err => logger.error('MongoDB connection error:', err));

const connectedUsers = new Map(); // Track connected users

io.on('connection', (socket) => {
  logger.debug('New client connected');

  socket.on('authenticate', (userId) => {
    socket.userId = userId;
    connectedUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    
    socket.broadcast.emit('userOnline', userId);
    logger.info(`User ${userId} authenticated and joined`);
  });

  socket.on('joinNeighborhood', (neighborhoodId) => {
    socket.join(neighborhoodId);
    logger.info(`User joined neighborhood: ${neighborhoodId}`);
  });

  socket.on('forumMessage', (data) => {
    io.to(data.neighborhoodId).emit('newForumMessage', data);
  });

  socket.on('marketplaceUpdate', (data) => {
    io.to(data.neighborhoodId).emit('marketplaceUpdate', data);
  });

  socket.on('safetyAlert', (data) => {
    io.to(data.neighborhoodId).emit('safetyAlert', data);
  });

  socket.on('privateMessage', (data) => {
    const { recipientId, senderId, content, senderName } = data;
    
    io.to(`user_${recipientId}`).emit('privateMessage', {
      senderId,
      senderName,
      content,
      createdAt: new Date().toISOString()
    });
    
    logger.debug(`Private message from ${senderId} to ${recipientId}`);
  });

  socket.on('getOnlineUsers', () => {
    const onlineUserIds = Array.from(connectedUsers.keys());
    socket.emit('onlineUsers', onlineUserIds);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      socket.broadcast.emit('userOffline', socket.userId);
      logger.info(`User ${socket.userId} disconnected`);
    }
    logger.debug('Client disconnected');
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});
