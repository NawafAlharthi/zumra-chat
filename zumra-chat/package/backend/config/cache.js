const NodeCache = require('node-cache');
const performanceConfig = require('./performance');

/**
 * Cache service for improving performance
 * This module provides in-memory caching to reduce database load
 * and improve response times for frequently accessed data
 */

class CacheService {
  constructor() {
    // Initialize cache with standard TTL of 5 minutes and check period of 1 minute
    this.cache = new NodeCache({
      stdTTL: 300,
      checkperiod: 60,
      useClones: false // For better performance with large objects
    });
    
    // Track cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
    
    // Log cache stats periodically
    setInterval(() => {
      console.log('Cache stats:', {
        ...this.stats,
        keys: this.cache.keys().length,
        hitRate: this.stats.hits / (this.stats.hits + this.stats.misses || 1)
      });
    }, 60000); // Every minute
  }
  
  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or undefined if not found
   */
  get(key) {
    const value = this.cache.get(key);
    if (value === undefined) {
      this.stats.misses++;
      return undefined;
    }
    
    this.stats.hits++;
    return value;
  }
  
  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {boolean} Success
   */
  set(key, value, ttl) {
    this.stats.sets++;
    return this.cache.set(key, value, ttl);
  }
  
  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   * @returns {number} Number of deleted entries
   */
  del(key) {
    return this.cache.del(key);
  }
  
  /**
   * Clear all cache
   * @returns {void}
   */
  flush() {
    this.cache.flushAll();
    console.log('Cache flushed');
  }
  
  /**
   * Get or set cache value with automatic fetching
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if not in cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<any>} Resolved with cached or fetched value
   */
  async getOrSet(key, fetchFn, ttl) {
    const cachedValue = this.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    try {
      const fetchedValue = await fetchFn();
      if (fetchedValue !== undefined) {
        this.set(key, fetchedValue, ttl);
      }
      return fetchedValue;
    } catch (error) {
      console.error(`Error fetching data for cache key ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Get cache middleware for Express
   * @param {number} duration - Cache duration in seconds
   * @returns {Function} Express middleware
   */
  middleware(duration = 60) {
    return (req, res, next) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }
      
      // Create a cache key from the URL
      const key = `__express__${req.originalUrl || req.url}`;
      
      // Try to get from cache
      const cachedBody = this.get(key);
      if (cachedBody) {
        res.send(cachedBody);
        return;
      }
      
      // Store the original send function
      const originalSend = res.send;
      
      // Override send
      res.send = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(key, body, duration);
        }
        
        // Call the original send function
        originalSend.call(res, body);
      };
      
      next();
    };
  }
  
  /**
   * Invalidate cache for a specific pattern
   * @param {string} pattern - Pattern to match keys
   * @returns {number} Number of invalidated keys
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keys = this.cache.keys().filter(key => regex.test(key));
    let count = 0;
    
    keys.forEach(key => {
      this.cache.del(key);
      count++;
    });
    
    return count;
  }
}

// Export singleton instance
module.exports = new CacheService();
