const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { convertFile, isConversionSupported, getExtension } = require('../conversions');
const config = require('../config');
const { logger } = require('../logger');
const { authenticateToken, associateUser, checkFileOwnership } = require('../middleware/auth');

const router = express.Router();

// Configure directories
const uploadDir = path.join(process.cwd(), config.storage.uploadDir);
const convertedDir = path.join(process.cwd(), config.storage.convertedDir);

// Ensure directories exist
if (!fsSync.existsSync(uploadDir)) {
  fsSync.mkdirSync(uploadDir, { recursive: true });
}

if (!fsSync.existsSync(convertedDir)) {
  fsSync.mkdirSync(convertedDir, { recursive: true });
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
    fileSize: config.storage.maxFileSize || (20 * 1024 * 1024) // 20MB limit default
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
    const { filename, targetFormat, useCase, options = {} } = req.body;
    
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
    
    const filePath = path.join(uploadDir, filename);
    
    // Check if the file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      logger.warn('File not found for conversion', { filename });
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Get source format from file extension
    const sourceFormat = getExtension(filePath);
    
    // Check if conversion is supported
    if (!isConversionSupported(sourceFormat, targetFormat)) {
      logger.warn('Unsupported conversion', { sourceFormat, targetFormat });
      return res.status(400).json({ 
        success: false, 
        message: `Conversion from ${sourceFormat} to ${targetFormat} is not supported` 
      });
    }
    
    // Set default options
    const conversionOptions = {
      useOcr: true, // Default to using OCR when needed
      language: 'eng', // Default OCR language
      ...options
    };
    
    try {
      logger.info('Starting file conversion', {
        filename,
        sourceFormat,
        targetFormat,
        useCase,
        options: conversionOptions
      });

      // Perform the conversion
      const result = await convertFile(
        filePath, 
        convertedDir, 
        targetFormat, 
        useCase, 
        conversionOptions
      );
      
      logger.info('File converted successfully', {
        inputFile: filename,
        outputFile: result.fileName,
        sourceFormat,
        targetFormat,
        usedOcr: result.usedOcr || false
      });

      // Return the conversion result
      return res.status(200).json({
        success: true,
        message: 'File converted successfully',
        conversion: {
          fileName: result.fileName,
          downloadUrl: `/downloads/${result.fileName}`,
          sourceFormat,
          targetFormat,
          usedOcr: result.usedOcr || false
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
router.get('/files/:filename', checkFileOwnership, async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, filename);
  
  try {
    const fileStats = await fs.stat(filePath);
    res.json({
      success: true,
      file: {
        filename,
        size: fileStats.size,
        createdAt: fileStats.birthtime
      }
    });
  } catch (error) {
    logger.warn('File not found', { filename });
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

// Preview text-based files
router.get('/preview/:filename', checkFileOwnership, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(convertedDir, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
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
        const content = await fs.readFile(filePath, 'utf8');
        return res.status(200).json({
          success: true,
          content
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
  } catch (error) {
    logger.error('Preview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve converted files
router.get('/downloads/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(convertedDir, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).send('File not found');
    }
    
    res.download(filePath);
  } catch (error) {
    logger.error('Download error:', error);
    res.status(500).send('Error downloading file');
  }
});

module.exports = router;