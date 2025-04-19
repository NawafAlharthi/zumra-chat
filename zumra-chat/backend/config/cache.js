const NodeCache = require('node-cache');
const performanceConfig = require('./performance');

// Create cache instance
const cache = new NodeCache({
  stdTTL: 100, // Default TTL in seconds
  checkperiod: 120 // Check for expired keys every 2 minutes
});

// Cache middleware factory
const cacheMiddleware = (key, ttl) => {
  return (req, res, next) => {
    // Skip cache for authenticated requests that are user-specific
    if (req.user && key !== 'userProfile') {
      return next();
    }
    
    // Generate cache key based on URL and optional user ID
    const userId = req.user ? req.user.id : 'anonymous';
    const cacheKey = `${key}_${req.originalUrl}_${userId}`;
    
    // Try to get from cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // Store original send function
    const originalSend = res.json;
    
    // Override res.json method
    res.json = function(data) {
      // Store in cache
      cache.set(cacheKey, data, ttl || performanceConfig.caching.ttl[key] || 60);
      
      // Call original method
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Cache service for programmatic use
const cacheService = {
  // Get item from cache
  get: (key) => {
    return cache.get(key);
  },
  
  // Set item in cache
  set: (key, value, ttl) => {
    return cache.set(key, value, ttl || 60);
  },
  
  // Delete item from cache
  del: (key) => {
    return cache.del(key);
  },
  
  // Flush entire cache
  flush: () => {
    return cache.flushAll();
  },
  
  // Get cache stats
  stats: () => {
    return cache.getStats();
  }
};

module.exports = {
  cacheMiddleware,
  cacheService
};
