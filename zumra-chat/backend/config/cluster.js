const cluster = require('cluster');
const os = require('os');
const performanceConfig = require('./performance');

// Function to set up clustering for horizontal scaling
const setupClustering = () => {
  // Get number of CPUs
  const numCPUs = os.cpus().length;
  
  // Determine number of workers (leave one core for the OS)
  const numWorkers = Math.max(1, numCPUs - 1);
  
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    console.log(`Setting up ${numWorkers} workers for horizontal scaling`);
    
    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }
    
    // Handle worker exit and restart
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
      cluster.fork();
    });
    
    return true; // Is master
  } else {
    console.log(`Worker ${process.pid} started`);
    return false; // Is worker
  }
};

module.exports = setupClustering;
