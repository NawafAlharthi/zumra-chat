const performanceConfig = {
  // Socket.io performance optimizations
  socketOptions: {
    // Ping timeout (how long to wait for a ping response)
    pingTimeout: 30000,
    
    // Ping interval (how often to send a ping)
    pingInterval: 25000,
    
    // Upgrade timeout (how long to wait for an upgrade response)
    upgradeTimeout: 10000,
    
    // Max HTTP buffer size
    maxHttpBufferSize: 1e6, // 1MB
    
    // Transports to use (websocket is more efficient than polling)
    transports: ['websocket'],
    
    // Compression settings
    perMessageDeflate: {
      threshold: 1024, // Only compress messages larger than 1KB
      zlibDeflateOptions: {
        chunkSize: 16 * 1024 // 16KB
      },
      zlibInflateOptions: {
        windowBits: 15,
        memLevel: 8
      }
    },
    
    // Connection throttling
    connectTimeout: 45000,
    
    // Adapter options
    adapter: {
      rooms: new Map(),
      sids: new Map(),
      cleanupInterval: 30000 // Clean up empty rooms every 30 seconds
    }
  },
  
  // Express performance optimizations
  expressOptions: {
    // Compression options
    compression: {
      level: 6, // Compression level (0-9)
      threshold: 1024, // Only compress responses larger than 1KB
      filter: (req, res) => {
        // Don't compress responses for older browsers without gzip support
        if (req.headers['accept-encoding'] && 
            req.headers['accept-encoding'].includes('gzip')) {
          return true;
        }
        return false;
      }
    },
    
    // Static file serving options
    static: {
      maxAge: '1d', // Cache static assets for 1 day
      etag: true, // Use ETags for caching
      lastModified: true, // Use Last-Modified for caching
      setHeaders: (res, path) => {
        // Set cache control headers based on file type
        if (path.endsWith('.html')) {
          // Don't cache HTML files
          res.setHeader('Cache-Control', 'no-cache');
        } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
          // Cache assets for 1 day
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
      }
    }
  },
  
  // Rate limiting configuration
  rateLimiting: {
    // General API rate limiting
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      message: 'Too many requests, please try again later.'
    },
    
    // Authentication endpoints rate limiting (stricter)
    auth: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // Limit each IP to 10 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Too many login attempts, please try again later.'
    },
    
    // Socket connection rate limiting
    socket: {
      windowMs: 60 * 1000, // 1 minute
      max: 10 // Limit each IP to 10 connections per minute
    }
  },
  
  // Database query optimization
  database: {
    // Maximum number of messages to fetch per room
    maxMessagesPerRoom: 100,
    
    // Maximum number of participants to track per room
    maxParticipantsPerRoom: 50,
    
    // Batch size for database operations
    batchSize: 50,
    
    // Query timeout in milliseconds
    queryTimeout: 5000
  },
  
  // Memory management
  memory: {
    // Maximum number of rooms to keep in memory
    maxRoomsInMemory: 1000,
    
    // Maximum age of inactive rooms before cleanup (in milliseconds)
    roomExpiryTime: 24 * 60 * 60 * 1000, // 24 hours
    
    // Interval for memory cleanup (in milliseconds)
    cleanupInterval: 60 * 60 * 1000 // 1 hour
  },
  
  // Clustering configuration
  clustering: {
    // Whether to enable clustering
    enabled: true,
    
    // Number of worker processes (0 = use all available CPUs)
    workers: 0,
    
    // Restart delay after worker crash (in milliseconds)
    restartDelay: 1000
  }
};

module.exports = performanceConfig;
