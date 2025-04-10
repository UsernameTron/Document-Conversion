const winston = require('winston');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), config.logging?.directory || 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  (config.logging?.format === 'json')
    ? winston.format.json()
    : winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      })
);

// Create the logger
const logger = winston.createLogger({
  level: config.logging?.level || 'info',
  format: logFormat,
  defaultMeta: { service: 'document-conversion' },
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, ...meta }) =>
            `${timestamp} ${level}: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`
        )
      ),
    }),
    // Write to all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),
    // Write error logs to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
  ],
});

// Create Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = new Date();
  
  // Once the request is finished
  res.on('finish', () => {
    const duration = new Date() - start;
    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      duration: `${duration}ms`
    });
  });
  
  next();
};

// Create a stream object for Morgan
// This allows Express to use Winston for HTTP request logging
const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = { logger, requestLogger, stream };