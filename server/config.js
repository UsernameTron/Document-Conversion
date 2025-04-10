/**
 * Application configuration file
 */

// Environment-specific configuration
const env = process.env.NODE_ENV || 'development';

// Base configuration
const config = {
  // Set defaults for all required configuration
  environment: env,
  // Server settings
  server: {
    port: process.env.PORT || 3333,
    host: process.env.HOST || 'localhost',
  },

  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    cookieSecret: process.env.COOKIE_SECRET || 'cookie-secret-change-in-production',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // File storage settings
  storage: {
    uploadDir: 'uploads',
    convertedDir: 'converted',
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'text/markdown',
      'text/html',
      'application/json',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/tiff',
    ],
    cleanupInterval: 60 * 60 * 1000, // 1 hour
    fileExpiry: 60 * 60 * 1000, // 1 hour
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
    format: process.env.LOG_FORMAT || (env === 'production' ? 'json' : 'simple'),
    directory: 'logs',
  },

  // Feature flags
  features: {
    auth: false, // set to true to enable authentication
    ocr: true,
    rateLimit: env === 'production', // Only enable in production
  },
};

// Environment-specific overrides
const environmentConfig = {
  development: {
    logging: {
      level: 'debug',
      format: 'simple',
      directory: 'logs'
    },
  },
  production: {
    logging: {
      level: 'info',
    },
    security: {
      // Ensure these are set in environment variables in production
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  test: {
    storage: {
      uploadDir: 'test/uploads',
      convertedDir: 'test/converted',
      cleanupInterval: null, // Disable cleanup in tests
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'text/markdown',
        'text/html',
        'application/json',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/tiff',
      ],
    },
  },
};

// Merge base config with environment-specific config
const finalConfig = {
  ...config,
  ...(environmentConfig[env] || {}),
};

// Ensure critical paths have defaults
if (!finalConfig.logging) {
  finalConfig.logging = {
    level: 'info',
    format: 'simple',
    directory: 'logs'
  };
}

module.exports = finalConfig;