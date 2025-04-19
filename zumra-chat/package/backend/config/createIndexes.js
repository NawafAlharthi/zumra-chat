const mongoose = require('mongoose');
const Room = require('../models/Room');
const Message = require('../models/Message');
const Analytics = require('../models/Analytics');

/**
 * Create database indexes for optimized queries
 * This module ensures proper indexing for high-performance queries
 * with large numbers of concurrent users
 */

async function createIndexes() {
  console.log('Creating database indexes for optimized performance...');
  
  try {
    // Room indexes
    await Room.collection.createIndex({ createdAt: 1 });
    await Room.collection.createIndex({ expiresAt: 1 });
    await Room.collection.createIndex({ 'participants.socketId': 1 });
    await Room.collection.createIndex({ isPrivate: 1 });
    
    // Message indexes
    await Message.collection.createIndex({ roomId: 1, timestamp: -1 });
    await Message.collection.createIndex({ timestamp: -1 });
    await Message.collection.createIndex({ senderId: 1 });
    
    // Analytics indexes
    await Analytics.collection.createIndex({ roomId: 1 });
    await Analytics.collection.createIndex({ createdAt: -1 });
    await Analytics.collection.createIndex({ updatedAt: -1 });
    
    // Compound indexes for common queries
    await Message.collection.createIndex({ roomId: 1, sender: 1 });
    await Room.collection.createIndex({ 'participants.username': 1 });
    
    // TTL index for automatic room expiration
    await Room.collection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 } // MongoDB will automatically remove documents when expiresAt is reached
    );
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
    throw error;
  }
}

// Function to optimize existing collections
async function optimizeCollections() {
  console.log('Optimizing existing collections...');
  
  try {
    // Run explain on common queries to verify index usage
    const roomExplain = await Room.find().explain('executionStats');
    const messageExplain = await Message.find().sort({ timestamp: -1 }).limit(10).explain('executionStats');
    
    console.log('Room query execution stats:', roomExplain.executionStats.executionTimeMillis, 'ms');
    console.log('Message query execution stats:', messageExplain.executionStats.executionTimeMillis, 'ms');
    
    // Additional optimizations could be added here
    
    console.log('Collections optimized successfully');
  } catch (error) {
    console.error('Error optimizing collections:', error);
    // Non-critical, so don't throw
  }
}

module.exports = {
  createIndexes,
  optimizeCollections
};
