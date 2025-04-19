const cluster = require('cluster');
const os = require('os');
const performanceConfig = require('./performance');

/**
 * Cluster configuration for horizontal scaling
 * This module enables the application to utilize multiple CPU cores
 * for handling more concurrent connections
 */

// Function to initialize clustering
function setupCluster(callback) {
  // Skip clustering if disabled in config or in development mode
  if (!performanceConfig.clustering.enabled || process.env.NODE_ENV !== 'production') {
    console.log('Clustering disabled. Running in single process mode.');
    return callback();
  }

  // Determine number of workers
  const numWorkers = performanceConfig.clustering.workers || os.cpus().length;

  if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);
    console.log(`Setting up ${numWorkers} workers...`);

    // Track worker restarts to prevent excessive restarts
    const workerRestarts = {};
    const MAX_RESTARTS = 5;
    const RESTART_WINDOW = 60000; // 1 minute

    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    // Handle worker events
    cluster.on('exit', (worker, code, signal) => {
      const workerId = worker.id;
      const now = Date.now();

      // Initialize restart tracking for this worker if not exists
      if (!workerRestarts[workerId]) {
        workerRestarts[workerId] = [];
      }

      // Clean up old restart records
      workerRestarts[workerId] = workerRestarts[workerId].filter(
        time => now - time < RESTART_WINDOW
      );

      // Add current restart
      workerRestarts[workerId].push(now);

      // Check if we've had too many restarts
      if (workerRestarts[workerId].length > MAX_RESTARTS) {
        console.error(`Worker ${workerId} crashed too many times. Not restarting.`);
        return;
      }

      console.log(`Worker ${worker.process.pid} died (${code}). Restarting...`);
      
      // Delay restart to prevent CPU spikes from rapid restarts
      setTimeout(() => {
        cluster.fork();
      }, performanceConfig.clustering.restartDelay);
    });

    // Log when a worker comes online
    cluster.on('online', (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
    });

    // Set up periodic health check
    setInterval(() => {
      for (const id in cluster.workers) {
        cluster.workers[id].send('health_check');
      }
    }, 30000);
  } else {
    // Worker process
    console.log(`Worker ${process.pid} started`);
    
    // Handle messages from master
    process.on('message', (msg) => {
      if (msg === 'health_check') {
        // Could implement more sophisticated health checking here
        process.send({ status: 'healthy', pid: process.pid, memory: process.memoryUsage() });
      }
    });

    // Execute the worker code
    callback();
  }
}

module.exports = setupCluster;
