const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Create database indexes for better query performance
 */
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ neighborhoodId: 1 });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ isVerified: 1 });
    await db.collection('users').createIndex({ 'address.coordinates': '2dsphere' });
    await db.collection('users').createIndex({ lastActive: -1 });
    
    // Forum posts indexes
    await db.collection('forumposts').createIndex({ neighborhoodId: 1 });
    await db.collection('forumposts').createIndex({ authorId: 1 });
    await db.collection('forumposts').createIndex({ category: 1 });
    await db.collection('forumposts').createIndex({ lastActivity: -1 });
    await db.collection('forumposts').createIndex({ createdAt: -1 });
    await db.collection('forumposts').createIndex({ tags: 1 });
    await db.collection('forumposts').createIndex({ isSticky: -1, lastActivity: -1 });
    await db.collection('forumposts').createIndex({ 
      title: 'text', 
      content: 'text' 
    }, { 
      name: 'forum_text_search' 
    });
    
    // Comments indexes
    await db.collection('comments').createIndex({ postId: 1 });
    await db.collection('comments').createIndex({ authorId: 1 });
    await db.collection('comments').createIndex({ parentCommentId: 1 });
    await db.collection('comments').createIndex({ createdAt: -1 });
    
    // Messages indexes
    await db.collection('messages').createIndex({ conversationId: 1 });
    await db.collection('messages').createIndex({ senderId: 1 });
    await db.collection('messages').createIndex({ recipientId: 1 });
    await db.collection('messages').createIndex({ createdAt: -1 });
    await db.collection('messages').createIndex({ isRead: 1 });
    await db.collection('messages').createIndex({ 
      senderId: 1, 
      recipientId: 1, 
      createdAt: -1 
    });
    
    // Marketplace listings indexes
    await db.collection('marketplacelistings').createIndex({ neighborhoodId: 1 });
    await db.collection('marketplacelistings').createIndex({ sellerId: 1 });
    await db.collection('marketplacelistings').createIndex({ category: 1 });
    await db.collection('marketplacelistings').createIndex({ status: 1 });
    await db.collection('marketplacelistings').createIndex({ price: 1 });
    await db.collection('marketplacelistings').createIndex({ createdAt: -1 });
    await db.collection('marketplacelistings').createIndex({ 
      'location.coordinates': '2dsphere' 
    });
    await db.collection('marketplacelistings').createIndex({ 
      title: 'text', 
      description: 'text' 
    }, { 
      name: 'marketplace_text_search' 
    });
    
    // Safety reports indexes
    await db.collection('safetyreports').createIndex({ neighborhoodId: 1 });
    await db.collection('safetyreports').createIndex({ reporterId: 1 });
    await db.collection('safetyreports').createIndex({ type: 1 });
    await db.collection('safetyreports').createIndex({ severity: 1 });
    await db.collection('safetyreports').createIndex({ status: 1 });
    await db.collection('safetyreports').createIndex({ createdAt: -1 });
    await db.collection('safetyreports').createIndex({ 
      'location.coordinates': '2dsphere' 
    });
    await db.collection('safetyreports').createIndex({ incidentDateTime: -1 });
    
    // Neighborhoods indexes
    await db.collection('neighborhoods').createIndex({ zipCodes: 1 });
    await db.collection('neighborhoods').createIndex({ 
      'boundaries.coordinates': '2dsphere' 
    });
    
    logger.info('Database indexes created successfully');
    
  } catch (error) {
    logger.error('Error creating database indexes:', error);
  }
};

/**
 * Drop all custom indexes (useful for development)
 */
const dropIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const collections = ['users', 'forumposts', 'comments', 'messages', 'marketplacelistings', 'safetyreports', 'neighborhoods'];
    
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).dropIndexes();
        logger.info(`Dropped indexes for ${collectionName}`);
      } catch (error) {
        // Collection might not exist or have no indexes
        logger.warn(`Could not drop indexes for ${collectionName}:`, error.message);
      }
    }
    
    logger.info('All indexes dropped successfully');
    
  } catch (error) {
    logger.error('Error dropping database indexes:', error);
  }
};

/**
 * Get index information for all collections
 */
const getIndexInfo = async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const indexInfo = {};
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const indexes = await db.collection(collectionName).indexes();
      indexInfo[collectionName] = indexes;
    }
    
    return indexInfo;
    
  } catch (error) {
    logger.error('Error getting index information:', error);
    return null;
  }
};

module.exports = {
  createIndexes,
  dropIndexes,
  getIndexInfo
};
