const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { logger } = require('../logger');

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Server error', { error: err.message, stack: err.stack });

  // Send appropriate error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Not found middleware
const notFound = (req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

// CORS error handling
const corsErrorHandler = (err, req, res, next) => {
  if (err.name === 'SyntaxError') {
    logger.warn('Invalid JSON', { error: err.message });
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON provided',
    });
  }
  next(err);
};

// Apply security middleware to Express app
const setupSecurity = (app) => {
  // Use helmet for security headers
  app.use(helmet());

  // Apply rate limiting in production
  if (config.features.rateLimit) {
    app.use(limiter);
  }

  // Register error handling middleware
  app.use(corsErrorHandler);
  
  // These should be registered last
  app.use(notFound);
  app.use(errorHandler);
};

module.exports = setupSecurity;