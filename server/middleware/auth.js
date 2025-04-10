const jwt = require('jsonwebtoken');
const config = require('../config');
const { logger } = require('../logger');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Skip auth if not enabled in config
  if (!config.features.auth) {
    return next();
  }

  // Get token from header or cookie
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.token;

  if (!token) {
    logger.warn('Authentication failed: No token provided');
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Verify the token
  jwt.verify(token, config.security.jwtSecret, (err, user) => {
    if (err) {
      logger.warn('Authentication failed: Invalid token', { error: err.message });
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Store user info in request object
    req.user = user;
    next();
  });
};

// Function to generate JWT token
const generateToken = (userData) => {
  return jwt.sign(userData, config.security.jwtSecret, {
    expiresIn: config.security.jwtExpiry
  });
};

// Middleware to associate files with user
const associateUser = (req, res, next) => {
  // Skip if auth is not enabled
  if (!config.features.auth) {
    return next();
  }

  // Add user ID to request body for file ownership
  if (req.user && req.user.id) {
    req.body.userId = req.user.id;
  }
  
  next();
};

// Middleware to check file ownership
const checkFileOwnership = (req, res, next) => {
  // Skip if auth is not enabled
  if (!config.features.auth) {
    return next();
  }

  const { filename } = req.params;
  
  // In a real app, you would check the file ownership in a database
  // For this example, we'll use a simple check based on the filename prefix
  
  // The file should be prefixed with the user ID or have user info in DB
  // This is a placeholder - implement real ownership checking in production
  const userOwnsFile = true; // Replace with actual check
  
  if (!userOwnsFile) {
    logger.warn('File access denied', {
      userId: req.user?.id,
      filename
    });
    
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this file'
    });
  }
  
  next();
};

module.exports = { authenticateToken, generateToken, associateUser, checkFileOwnership };