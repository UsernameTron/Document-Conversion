const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes/api');
const config = require('./config');
const { logger, requestLogger } = require('./logger');
const setupSecurity = require('./middleware/security');

// __dirname is already available in CommonJS

// Initialize express app
const app = express();
const PORT = config.server.port;

// Configure base middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.security.cookieSecret));

// Set up request logging
app.use(requestLogger);

// Ensure directories exist
const uploadDir = path.join(process.cwd(), config.storage.uploadDir);
const convertedDir = path.join(process.cwd(), config.storage.convertedDir);
const logsDir = path.join(process.cwd(), config.logging.directory);

[uploadDir, convertedDir, logsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
});

// Serve converted files statically (with cache control headers)
app.use('/converted', (req, res, next) => {
  // Set cache control headers
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
  next();
}, express.static(convertedDir));

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Set up security middleware (must be after routes)
setupSecurity(app);

// Cleanup job to remove files older than the configured time
const cleanupFiles = () => {
  [uploadDir, convertedDir].forEach(directory => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        logger.error(`Error reading directory ${directory}:`, err);
        return;
      }

      const now = Date.now();
      const expiryTime = now - config.storage.fileExpiry;

      files.forEach(file => {
        const filePath = path.join(directory, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            logger.error(`Error getting stats for file ${file}:`, err);
            return;
          }

          // Remove expired files
          if (stats.birthtime.getTime() < expiryTime) {
            fs.unlink(filePath, err => {
              if (err) {
                logger.error(`Error deleting file ${file}:`, err);
              } else {
                logger.info(`Deleted expired file: ${file}`);
              }
            });
          }
        });
      });
    });
  });
};

// Run cleanup at the configured interval (if cleanup is enabled)
if (config.storage.cleanupInterval) {
  setInterval(cleanupFiles, config.storage.cleanupInterval);
  logger.info(`File cleanup scheduled every ${config.storage.cleanupInterval / 1000 / 60} minutes`);
}

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Upload directory: ${uploadDir}`);
  logger.info(`Converted files directory: ${convertedDir}`);
  
  // Log feature flags
  Object.entries(config.features).forEach(([feature, enabled]) => {
    logger.info(`Feature ${feature}: ${enabled ? 'enabled' : 'disabled'}`);
  });
});