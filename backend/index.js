// Production server entry point with clustering support
const setupClustering = require('./config/cluster');
const createIndexes = require('./config/createIndexes');

// Check if we should use clustering in production
if (process.env.NODE_ENV === 'production') {
  // Set up clustering
  const isMaster = setupClustering();
  
  // Only continue for worker processes (or if clustering returned false)
  if (!isMaster) {
    // Start the actual server
    const server = require('./server');
    
    // Create database indexes for performance
    createIndexes();
  }
} else {
  // Development mode - no clustering
  const server = require('./server');
  
  // Create database indexes for performance
  createIndexes();
}
