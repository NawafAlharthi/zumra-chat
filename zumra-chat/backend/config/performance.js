// Performance optimization configurations for Socket.io
module.exports = {
  // Socket.io server options
  socketOptions: {
    // Transport options
    transports: ['websocket', 'polling'],
    
    // Ping settings
    pingTimeout: 60000,
    pingInterval: 25000,
    
    // Buffer size for messages
    maxHttpBufferSize: 1e6, // 1 MB
    
    // Connection throttling
    connectTimeout: 45000,
    
    // Adapter options for horizontal scaling
    adapter: {
      // Redis adapter would be used in production
      // This is a placeholder for configuration
      pubClient: null,
      subClient: null,
      key: 'zumra-socket-io'
    },
    
    // Performance optimizations
    perMessageDeflate: {
      threshold: 1024, // Only compress messages larger than 1KB
      zlibDeflateOptions: {
        level: 6, // Balance between compression ratio and CPU usage
        memLevel: 8
      }
    }
  },
  
  // Express server optimizations
  expressOptions: {
    // Compression settings
    compression: {
      level: 6,
      threshold: 1024, // Only compress responses larger than 1KB
      filter: (req, res) => {
        // Don't compress already compressed content types
        if (res.getHeader('Content-Type') && 
            (res.getHeader('Content-Type').includes('image/') ||
             res.getHeader('Content-Type').includes('video/'))) {
          return false;
        }
        return true;
      }
    },
    
    // Static file serving
    static: {
      maxAge: '1d', // Cache static assets for 1 day
      etag: true,
      lastModified: true
    }
  },
  
  // MongoDB optimization settings
  mongoOptions: {
    // Connection pool size
    poolSize: 10,
    
    // Read preference
    readPreference: 'secondaryPreferred',
    
    // Write concern
    w: 'majority',
    
    // Index options
    indexOptions: {
      // Indexes to create for performance
      room: [
        { participants: 1 },
        { createdAt: 1 },
        { expiresAt: 1 }
      ],
      message: [
        { roomId: 1, timestamp: 1 }
      ],
      analytics: [
        { roomId: 1 }
      ]
    }
  },
  
  // Rate limiting configuration
  rateLimiting: {
    // General API rate limits
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // Authentication endpoints (more strict)
    auth: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // Limit each IP to 10 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // Socket connection limits
    socket: {
      windowMs: 60 * 1000, // 1 minute
      max: 10 // Limit each IP to 10 connections per minute
    }
  },
  
  // Caching strategy
  caching: {
    // Memory cache TTL in seconds
    ttl: {
      roomList: 60, // 1 minute
      roomDetails: 30, // 30 seconds
      userProfile: 300, // 5 minutes
      analytics: 600 // 10 minutes
    }
  },
  
  // Load balancing configuration (for production)
  loadBalancing: {
    // Sticky sessions for Socket.io
    sticky: true,
    
    // Health check endpoint
    healthCheck: '/api/health'
  }
};
