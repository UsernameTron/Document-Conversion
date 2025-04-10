const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { convertFile } = require('../conversions/index');
const config = require('../config');
const { logger } = require('../logger');
const { authenticateToken, associateUser, checkFileOwnership } = require('../middleware/auth');

const router = express.Router();

// Configure directories
const uploadDir = path.join(process.cwd(), config.storage.uploadDir);
const convertedDir = path.join(process.cwd(), config.storage.convertedDir);

// Ensure directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(convertedDir)) {
  fs.mkdirSync(convertedDir, { recursive: true });
}

// Configuration for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const userPrefix = req.user?.id ? `${req.user.id}-` : '';
    cb(null, `${userPrefix}${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Set up file validation
const fileFilter = (req, file, cb) => {
  // Check if MIME type is allowed
  if (config.storage.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn('File upload rejected: Invalid file type', {
      mimetype: file.mimetype,
      filename: file.originalname
    });
    cb(new Error('Invalid file type. Only documents, spreadsheets, and text files are allowed.'), false);
  }
};

// Configure multer with storage and file filter
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.storage.maxFileSize
  }
});

// Apply authentication to all routes (if enabled)
router.use(authenticateToken);

// Upload file route
router.post('/upload', associateUser, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      logger.warn('File upload failed: No file uploaded');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Retrieve the use case and format from the request
    const { useCase, format } = req.body;
    
    if (!useCase || !format) {
      logger.warn('File upload missing parameters', {
        useCase,
        format
      });
      return res.status(400).json({
        success: false,
        message: 'Missing use case or format information'
      });
    }

    logger.info('File uploaded successfully', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Return initial upload success
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      },
      meta: {
        useCase,
        format
      }
    });
    
  } catch (error) {
    logger.error('Error in file upload', { error: error.message });
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Convert file route
router.post('/convert', associateUser, async (req, res) => {
  try {
    const { filename, targetFormat, useCase, options } = req.body;
    
    if (!filename || !targetFormat || !useCase) {
      logger.warn('Conversion missing parameters', {
        filename,
        targetFormat,
        useCase
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters (filename, targetFormat, useCase)'
      });
    }
    
    const inputFilePath = path.join(uploadDir, filename);
    
    // Check if the file exists
    if (!fs.existsSync(inputFilePath)) {
      logger.warn('File not found for conversion', { filename });
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Parse conversion options
    const conversionOptions = options || {};
    
    // Default OCR to true if not specified
    if (conversionOptions.useOcr === undefined) {
      conversionOptions.useOcr = true;
    }
    
    // Set default OCR language to English if not specified
    if (!conversionOptions.language) {
      conversionOptions.language = 'eng';
    }
    
    try {
      logger.info('Starting file conversion', {
        filename,
        targetFormat,
        useCase,
        options: conversionOptions
      });

      // Convert the file with options
      const conversionResult = await convertFile(
        inputFilePath, 
        convertedDir, 
        targetFormat, 
        useCase, 
        conversionOptions
      );
      
      logger.info('File converted successfully', {
        inputFile: filename,
        outputFile: conversionResult.fileName,
        format: conversionResult.format
      });

      // Return the conversion result
      return res.status(200).json({
        success: true,
        message: 'File converted successfully',
        conversion: {
          ...conversionResult,
          downloadUrl: `/converted/${conversionResult.fileName}`
        }
      });
    } catch (conversionError) {
      logger.error('Conversion error', { error: conversionError.message });
      return res.status(400).json({
        success: false,
        message: `Conversion error: ${conversionError.message}`
      });
    }
    
  } catch (error) {
    logger.error('Server error in conversion', { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get file details route
router.get('/files/:filename', checkFileOwnership, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);
  
  if (fs.existsSync(filePath)) {
    const fileStats = fs.statSync(filePath);
    res.json({
      success: true,
      file: {
        filename,
        size: fileStats.size,
        createdAt: fileStats.birthtime
      }
    });
  } else {
    logger.warn('File not found', { filename });
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

// Preview text-based files
router.get('/preview/:filename', checkFileOwnership, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(convertedDir, filename);
  
  if (!fs.existsSync(filePath)) {
    logger.warn('Preview file not found', { filename });
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  
  const extension = path.extname(filePath).toLowerCase();
  
  // Only allow previewing text files
  if (['.txt', '.md', '.html', '.json', '.csv'].includes(extension)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return res.status(200).json({
        success: true,
        content: content
      });
    } catch (error) {
      logger.error('Error reading file for preview', { error: error.message, filename });
      return res.status(500).json({
        success: false,
        message: `Error reading file: ${error.message}`
      });
    }
  } else {
    logger.warn('Invalid file type for preview', { filename, extension });
    return res.status(400).json({
      success: false,
      message: 'Preview is only available for text-based files'
    });
  }
});

module.exports = router;