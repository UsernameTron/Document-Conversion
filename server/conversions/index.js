const { textToPdf } = require('./textToPdf');
const { pdfToText } = require('./pdfToText');
const { docxToPdf } = require('./docxToPdf');
const { docxToHtml } = require('./docxToHtml');
const { csvToJson } = require('./csvToJson');
const { csvToHtml } = require('./csvToHtml');
const { csvToPdf } = require('./csvToPdf');
const { csvToChart } = require('./csvToChart');
const { jsonToCsv } = require('./jsonToCsv');
const { jsonToHtml } = require('./jsonToHtml');
const { jsonToChart } = require('./jsonToChart');
const { markdownToHtml } = require('./markdownToHtml');
const { markdownToText } = require('./markdownToText');
const { markdownToPdf } = require('./markdownToPdf');
const { htmlToMarkdown } = require('./htmlToMarkdown');
const { htmlToText } = require('./htmlToText');
const { htmlToPdf } = require('./htmlToPdf');
const { txtToHtml } = require('./txtToHtml');
const { ocrImage } = require('./ocrImage');
const { ocrPdf } = require('./ocrPdf');
const { excelToCsv } = require('./excelToCsv');
const path = require('path');
const fs = require('fs/promises');

/**
 * Maps MIME types to file extensions
 */
const mimeToExtension = {
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/csv': 'csv',
  'text/markdown': 'md',
  'text/html': 'html',
  'application/json': 'json',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/tiff': 'tiff'
};

/**
 * Detects if a file might need OCR based on file type and content
 * @param {string} filePath - Path to the file
 * @param {string} fileExtension - File extension
 * @returns {Promise<boolean>} - Whether OCR might be needed
 */
async function mightNeedOcr(filePath, fileExtension) {
  // Images always need OCR
  if (['jpg', 'jpeg', 'png', 'tiff', 'bmp', 'gif'].includes(fileExtension)) {
    return true;
  }
  
  // For PDFs, we could check for text content, but this is a simplified implementation
  if (fileExtension === 'pdf') {
    // In a real implementation, you'd check if the PDF contains text or just images
    // For now, we'll assume all PDFs might need OCR
    return true;
  }
  
  return false;
}

/**
 * Conversion matrix to define which source formats can convert to which target formats
 */
const CONVERSION_MATRIX = {
  'pdf': ['text', 'txt', 'html', 'markdown', 'md'],
  'docx': ['pdf', 'html', 'text', 'txt', 'markdown', 'md'],
  'html': ['pdf', 'markdown', 'md', 'text', 'txt'],
  'md': ['html', 'pdf', 'text', 'txt'],
  'markdown': ['html', 'pdf', 'text', 'txt'],
  'csv': ['json', 'html', 'pdf', 'chart'],
  'json': ['csv', 'html', 'chart'],
  'xlsx': ['csv', 'json', 'pdf', 'chart'],
  'xls': ['csv', 'json', 'pdf', 'chart'],
  'txt': ['pdf', 'html'],
  'text': ['pdf', 'html']
};

/**
 * Checks if a conversion is supported by the conversion matrix
 * @param {string} sourceFormat - Source format
 * @param {string} targetFormat - Target format
 * @returns {boolean} - Whether the conversion is supported
 */
function isConversionSupported(sourceFormat, targetFormat) {
  // Check if source format is in the matrix
  if (!CONVERSION_MATRIX[sourceFormat]) {
    return false;
  }
  
  // Check if target format is in the supported list for this source
  return CONVERSION_MATRIX[sourceFormat].includes(targetFormat);
}

/**
 * Checks if a format is text-based
 * @param {string} format - Format to check
 * @returns {boolean} - Whether the format is text-based
 */
function isTextBasedFormat(format) {
  return ['txt', 'text', 'md', 'markdown', 'html', 'json', 'csv'].includes(format);
}

/**
 * Converts a file based on the input type and target format
 * @param {string} inputFilePath - Path to the input file
 * @param {string} outputDir - Directory to save the output file
 * @param {string} targetFormat - The target format (e.g., 'pdf', 'text')
 * @param {string} useCase - The use case for the conversion
 * @param {Object} options - Additional conversion options
 * @param {boolean} options.useOcr - Whether to use OCR for image-based documents
 * @param {string} options.language - OCR language (default: 'eng')
 * @returns {Promise<{filePath: string, fileName: string, format: string}>} - Information about the converted file
 */
async function convertFile(inputFilePath, outputDir, targetFormat, useCase, options = {}) {
  // Set default options
  const conversionOptions = {
    useOcr: true, // Default to using OCR when needed
    language: 'eng', // Default OCR language
    ...options
  };
  
  // Determine input file format based on extension
  const fileExtension = path.extname(inputFilePath).toLowerCase().substring(1); // Remove the dot
  
  console.log(`Converting from ${fileExtension} to ${targetFormat} for use case: ${useCase}`);
  
  // Check if OCR might be needed
  const needsOcr = conversionOptions.useOcr && await mightNeedOcr(inputFilePath, fileExtension);
  
  // If OCR is needed and the target format is text-based, use OCR directly
  if (needsOcr && isTextBasedFormat(targetFormat)) {
    console.log(`Using OCR for conversion from ${fileExtension} to ${targetFormat}`);
    
    let ocrResult;
    if (fileExtension === 'pdf') {
      ocrResult = await ocrPdf(inputFilePath, outputDir, { language: conversionOptions.language });
    } else {
      // Assume it's an image file
      ocrResult = await ocrImage(inputFilePath, outputDir, { language: conversionOptions.language });
    }
    
    return {
      filePath: ocrResult,
      fileName: path.basename(ocrResult),
      format: targetFormat,
      usedOcr: true
    };
  }
  
  // Define the conversion map
  const conversions = {
    // Text conversions
    'txt-to-pdf': {
      input: 'txt',
      output: 'pdf',
      converter: textToPdf
    },
    'txt-to-html': {
      input: 'txt',
      output: 'html',
      converter: txtToHtml
    },
    'pdf-to-txt': {
      input: 'pdf',
      output: 'txt',
      converter: pdfToText
    },
    'docx-to-pdf': {
      input: 'docx',
      output: 'pdf',
      converter: docxToPdf
    },
    'docx-to-html': {
      input: 'docx',
      output: 'html',
      converter: docxToHtml
    },
    
    // CSV conversions
    'csv-to-json': {
      input: 'csv',
      output: 'json',
      converter: csvToJson
    },
    'csv-to-html': {
      input: 'csv',
      output: 'html',
      converter: csvToHtml
    },
    'csv-to-pdf': {
      input: 'csv',
      output: 'pdf',
      converter: csvToPdf
    },
    'csv-to-chart': {
      input: 'csv',
      output: 'chart',
      converter: csvToChart
    },
    
    // JSON conversions
    'json-to-csv': {
      input: 'json',
      output: 'csv',
      converter: jsonToCsv
    },
    'json-to-html': {
      input: 'json',
      output: 'html',
      converter: jsonToHtml
    },
    'json-to-chart': {
      input: 'json',
      output: 'chart',
      converter: jsonToChart
    },
    
    // Markdown conversions
    'md-to-html': {
      input: 'md',
      output: 'html',
      converter: markdownToHtml
    },
    'md-to-txt': {
      input: 'md',
      output: 'txt',
      converter: markdownToText
    },
    'md-to-text': {
      input: 'md',
      output: 'text',
      converter: markdownToText
    },
    'md-to-pdf': {
      input: 'md',
      output: 'pdf',
      converter: markdownToPdf
    },
    
    // HTML conversions
    'html-to-md': {
      input: 'html',
      output: 'md',
      converter: htmlToMarkdown
    },
    'html-to-pdf': {
      input: 'html',
      output: 'pdf',
      converter: htmlToPdf
    },
    'html-to-txt': {
      input: 'html',
      output: 'txt',
      converter: htmlToText
    },
    'html-to-text': {
      input: 'html',
      output: 'text',
      converter: htmlToText
    },
    
    // Excel conversions
    'xls-to-csv': {
      input: 'xls',
      output: 'csv',
      converter: excelToCsv
    },
    'xlsx-to-csv': {
      input: 'xlsx', 
      output: 'csv',
      converter: excelToCsv
    }
  };
  
  // Add aliases for formats
  const formatAliases = {
    'text': 'txt',
    'markdown': 'md',
    'excel': 'xlsx'
  };
  
  // Normalize input and output formats using aliases
  const normalizedInput = formatAliases[fileExtension] || fileExtension;
  const normalizedOutput = formatAliases[targetFormat] || targetFormat;
  
  // Create a key for the conversion map
  const conversionKey = `${normalizedInput}-to-${normalizedOutput}`;
  
  // Check if the conversion is supported
  if (!conversions[conversionKey]) {
    // First check if the conversion is supported by our matrix
    // This allows us to plan for future implementations
    if (isConversionSupported(normalizedInput, normalizedOutput)) {
      console.log(`Conversion from ${normalizedInput} to ${normalizedOutput} is defined in matrix but not yet implemented.`);
      throw new Error(`Conversion from ${fileExtension} to ${targetFormat} is supported but not yet implemented.`);
    }
    
    // Handle simple no-conversion cases
    if (normalizedInput === normalizedOutput || 
        (normalizedInput === 'txt' && normalizedOutput === 'text') || 
        (normalizedInput === 'md' && normalizedOutput === 'markdown')) {
      
      // Just copy the file (no conversion needed)
      const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
      const outputFilePath = path.join(outputDir, `${inputFileName}_copy.${normalizedInput}`);
      await fs.copyFile(inputFilePath, outputFilePath);
      
      return {
        filePath: outputFilePath,
        fileName: path.basename(outputFilePath),
        format: normalizedOutput,
        noConversionNeeded: true
      };
    }
    
    throw new Error(`Conversion from ${fileExtension} to ${targetFormat} is not supported.`);
  }
  
  // Execute the conversion
  const outputFilePath = await conversions[conversionKey].converter(inputFilePath, outputDir);
  
  // Return information about the converted file
  return {
    filePath: outputFilePath,
    fileName: path.basename(outputFilePath),
    format: targetFormat
  };
}

module.exports = { 
  convertFile,
  mimeToExtension,
  isConversionSupported,
  CONVERSION_MATRIX
};