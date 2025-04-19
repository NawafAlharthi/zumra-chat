const mongoose = require('mongoose');
const performanceConfig = require('../config/performance');

// Create indexes for optimized queries
const createIndexes = async () => {
  try {
    console.log('Creating database indexes for performance optimization...');
    
    // Room indexes
    const Room = mongoose.model('Room');
    for (const index of performanceConfig.mongoOptions.indexOptions.room) {
      await Room.collection.createIndex(index);
    }
    
    // Message indexes
    const Message = mongoose.model('Message');
    for (const index of performanceConfig.mongoOptions.indexOptions.message) {
      await Message.collection.createIndex(index);
    }
    
    // Analytics indexes
    const Analytics = mongoose.model('Analytics');
    for (const index of performanceConfig.mongoOptions.indexOptions.analytics) {
      await Analytics.collection.createIndex(index);
    }
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error(`Error creating indexes: ${error.message}`);
  }
};

module.exports = createIndexes;
