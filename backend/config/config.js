/**
 * Application configuration settings
 */

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // Database
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/neighborhub',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  // JWT Settings
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // Cloudinary Settings
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'neighbor-hub'
  },
  
  // Rate Limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    general: {
      max: 100, // 100 requests per window
    },
    auth: {
      max: 5, // 5 auth attempts per window
    },
    upload: {
      max: 10, // 10 uploads per window
    },
    message: {
      max: 30, // 30 messages per window
    },
    post: {
      max: 10, // 10 posts per window
    }
  },
  
  // File Upload Settings
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 5
  },
  
  // Security Settings
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutTime: 30 * 60 * 1000, // 30 minutes
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // CORS Settings
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  },
  
  // Email Settings (for future implementation)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@neighborhub.com'
  },
  
  // Logging Settings
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
    file: {
      enabled: process.env.LOG_FILE_ENABLED === 'true',
      filename: process.env.LOG_FILENAME || 'app.log',
      maxsize: parseInt(process.env.LOG_MAX_SIZE) || 5242880, // 5MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
    }
  },
  
  // Pagination Settings
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  },
  
  // Geolocation Settings
  geolocation: {
    defaultRadius: 5, // 5 miles
    maxRadius: 50, // 50 miles
    unitSystem: 'miles' // 'miles' or 'kilometers'
  },
  
  // Cache Settings (for future implementation)
  cache: {
    ttl: 5 * 60, // 5 minutes
    maxKeys: 1000
  },
  
  // Feature Flags
  features: {
    enableRealTimeChat: process.env.ENABLE_REALTIME_CHAT !== 'false',
    enableImageUpload: process.env.ENABLE_IMAGE_UPLOAD !== 'false',
    enableGeolocation: process.env.ENABLE_GEOLOCATION !== 'false',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
    enableMarketplace: process.env.ENABLE_MARKETPLACE !== 'false',
    enableSafetyReports: process.env.ENABLE_SAFETY_REPORTS !== 'false',
  },
  
  // API Settings
  api: {
    version: 'v1',
    prefix: '/api',
    timeout: 30000, // 30 seconds
  },
  
  // Socket.io Settings
  socket: {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  }
};

// Validation for required environment variables in production
if (config.env === 'production') {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET', 
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

module.exports = config;
