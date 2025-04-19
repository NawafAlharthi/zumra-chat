const setupCluster = require('./config/cluster');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({
  path: process.env.NODE_ENV === 'production' 
    ? path.resolve(__dirname, '../.env.production')
    : path.resolve(__dirname, '../.env')
});

// Set up clustering for production
setupCluster(() => {
  // Import server only after cluster setup
  const { server } = require('./server');
  
  // Start server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log(`Worker ${process.pid} received SIGTERM signal, shutting down gracefully`);
    server.close(() => {
      console.log(`Worker ${process.pid} closed all connections`);
      process.exit(0);
    });
    
    // Force shutdown after 30 seconds if connections don't close
    setTimeout(() => {
      console.log(`Worker ${process.pid} could not close connections in time, forcefully shutting down`);
      process.exit(1);
    }, 30000);
  });
});
