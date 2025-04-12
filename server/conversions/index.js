const { textToPdf } = require('./textToPdf');
const { pdfToText } = require('./pdfToText');
const { docxToPdf } = require('./docxToPdf');
const { docxToHtml } = require('./docxToHtml');
const { docxToText } = require('./docxToText');
const { docxToMarkdown } = require('./docxToMarkdown');
const { txtToMarkdown } = require('./txtToMarkdown');
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
const { ocrImage, performOcr } = require('./ocrImage');
const { ocrPdf } = require('./ocrPdf');
const { excelToCsv } = require('./excelToCsv');
const { excelToJson } = require('./excelToJson');
const path = require('path');
const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');

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
  'pdf': ['text', 'txt', 'html', 'markdown', 'md', 'json'],
  'docx': ['pdf', 'html', 'text', 'txt', 'markdown', 'md'],
  'html': ['pdf', 'markdown', 'md', 'text', 'txt'],
  'md': ['html', 'pdf', 'text', 'txt'],
  'markdown': ['html', 'pdf', 'text', 'txt'],
  'csv': ['json', 'html', 'pdf', 'chart'],
  'json': ['csv', 'html', 'chart'],
  'xlsx': ['csv', 'json', 'pdf', 'chart'],
  'xls': ['csv', 'json', 'pdf', 'chart'],
  'txt': ['pdf', 'html', 'markdown', 'md'],
  'text': ['pdf', 'html', 'markdown', 'md']
};

/**
 * Get file extension without the dot
 * @param {string} filePath - Path to the file
 * @returns {string} - File extension without the dot
 */
function getExtension(filePath) {
  return path.extname(filePath).toLowerCase().substring(1);
}

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
 * Convert PDF to text with error handling for encrypted PDFs
 * @param {string} inputPath - Path to the PDF file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the extracted text file
 */
async function convertPdfToText(inputPath, outputDir) {
  try {
    const pdfBytes = await fs.readFile(inputPath);
    
    // Try to parse the PDF with pdf-parse
    let text;
    try {
      const data = await pdfParse(pdfBytes);
      text = data.text;
    } catch (parseError) {
      console.error('PDF parse error, trying fallback:', parseError.message);
      // Try with pdf-lib as fallback for encrypted PDFs
      try {
        const pdfDoc = await PDFDocument.load(pdfBytes, { 
          ignoreEncryption: true,
          updateMetadata: false,
          throwOnInvalidObject: false
        });
        // Extract text using pdf-lib (simplified version)
        text = `PDF document with ${pdfDoc.getPageCount()} pages. 
                Unable to extract full text - document may be encrypted.`;
      } catch (pdfLibError) {
        throw new Error(`Both PDF parsers failed: ${parseError.message} AND ${pdfLibError.message}`);
      }
    }
    
    const fileName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputDir, `${fileName}.txt`);
    await fs.writeFile(outputPath, text);
    return outputPath;
  } catch (error) {
    console.error('Error converting PDF to text:', error);
    throw error;
  }
}

/**
 * Converts a file based on the input type and target format with fallback mechanisms
 * @param {string} inputFile - Path to the input file
 * @param {string} outputDir - Directory to save the output file
 * @param {string} targetFormat - The target format (e.g., 'pdf', 'text')
 * @param {string} useCase - The use case for the conversion
 * @param {Object} options - Additional conversion options
 * @param {boolean} options.useOcr - Whether to use OCR for image-based documents
 * @param {string} options.language - OCR language (default: 'eng')
 * @returns {Promise<{success: boolean, fileName: string, filePath: string, sourceFormat: string, targetFormat: string, usedOcr: boolean}>}
 */
async function convertFile(inputFile, outputDir, targetFormat, useCase, options = {}) {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Get source format from file extension
    const sourceFormat = getExtension(inputFile);
    const fileName = path.basename(inputFile);
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // Set default options
    const conversionOptions = {
      useOcr: true, // Default to using OCR when needed
      language: 'eng', // Default OCR language
      ...options
    };
    
    console.log(`Converting from ${sourceFormat} to ${targetFormat} for use case: ${useCase}`);
    
    // Check if conversion is supported
    if (!isConversionSupported(sourceFormat, targetFormat)) {
      throw new Error(`Conversion from ${sourceFormat} to ${targetFormat} is not supported`);
    }
    
    let outputFile;
    
    // Try the primary conversion method
    try {
      // Check if OCR might be needed for PDFs and images
      const needsOcr = conversionOptions.useOcr && await mightNeedOcr(inputFile, sourceFormat);
      
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
        'txt-to-md': {
          input: 'txt',
          output: 'md',
          converter: txtToMarkdown
        },
        'txt-to-markdown': {
          input: 'txt',
          output: 'markdown',
          converter: txtToMarkdown
        },
        'pdf-to-txt': {
          input: 'pdf',
          output: 'txt',
          converter: pdfToText
        },
        'pdf-to-text': {
          input: 'pdf',
          output: 'text',
          converter: pdfToText
        },
        
        // DOCX conversions
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
        'docx-to-txt': {
          input: 'docx',
          output: 'txt',
          converter: docxToText
        },
        'docx-to-text': {
          input: 'docx',
          output: 'text',
          converter: docxToText
        },
        'docx-to-md': {
          input: 'docx',
          output: 'md',
          converter: docxToMarkdown
        },
        'docx-to-markdown': {
          input: 'docx',
          output: 'markdown',
          converter: docxToMarkdown
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
        },
        'xlsx-to-json': {
          input: 'xlsx',
          output: 'json',
          converter: excelToJson
        },
        'xls-to-json': {
          input: 'xls',
          output: 'json',
          converter: excelToJson
        }
      };
      
      // Add aliases for formats
      const formatAliases = {
        'text': 'txt',
        'markdown': 'md',
        'excel': 'xlsx'
      };
      
      // Normalize input and output formats using aliases
      const normalizedInput = formatAliases[sourceFormat] || sourceFormat;
      const normalizedOutput = formatAliases[targetFormat] || targetFormat;
      
      // Create a key for the conversion map
      const conversionKey = `${normalizedInput}-to-${normalizedOutput}`;
      
      // If OCR is needed and the target format is text-based, use OCR directly
      if (needsOcr && isTextBasedFormat(targetFormat)) {
        console.log(`Using OCR for conversion from ${sourceFormat} to ${targetFormat}`);
        
        if (sourceFormat === 'pdf') {
          outputFile = await ocrPdf(inputFile, outputDir, { language: conversionOptions.language });
        } else {
          // Assume it's an image file
          outputFile = await ocrImage(inputFile, outputDir, { language: conversionOptions.language });
        }
      }
      // Handle normal conversions
      else if (conversions[conversionKey]) {
        console.log(`Using ${conversionKey} converter`);
        outputFile = await conversions[conversionKey].converter(inputFile, outputDir);
      }
      // Handle simple no-conversion cases
      else if (normalizedInput === normalizedOutput || 
               (normalizedInput === 'txt' && normalizedOutput === 'text') || 
               (normalizedInput === 'md' && normalizedOutput === 'markdown')) {
        
        // Just copy the file (no conversion needed)
        outputFile = path.join(outputDir, `${fileNameWithoutExt}_copy.${normalizedInput}`);
        await fs.copyFile(inputFile, outputFile);
      }
      // Handle case when conversion is supported but not yet implemented
      else if (isConversionSupported(normalizedInput, normalizedOutput)) {
        throw new Error(`Conversion from ${sourceFormat} to ${targetFormat} is supported but not yet implemented.`);
      }
      // Otherwise, the conversion is not supported
      else {
        throw new Error(`Conversion from ${sourceFormat} to ${targetFormat} is not supported.`);
      }
    } catch (conversionError) {
      console.error(`Primary conversion failed: ${conversionError.message}`);
      
      // Try fallback for PDF to text conversion
      if (sourceFormat === 'pdf' && (targetFormat === 'text' || targetFormat === 'txt')) {
        console.log('Attempting alternative PDF to text conversion method');
        outputFile = await convertPdfToText(inputFile, outputDir);
      }
      // Try OCR as fallback for document to text conversion if enabled
      else if (options.useOcr && ['pdf', 'jpg', 'jpeg', 'png', 'tiff'].includes(sourceFormat) && 
          ['text', 'txt'].includes(targetFormat)) {
        console.log('Attempting OCR as fallback...');
        if (sourceFormat === 'pdf') {
          outputFile = await ocrPdf(inputFile, outputDir, { language: conversionOptions.language });
        } else {
          outputFile = await ocrImage(inputFile, outputDir, { language: conversionOptions.language });
        }
      }
      // If no fallback worked, re-throw the error
      else {
        throw conversionError;
      }
    }
    
    // Check if we have an output file
    if (!outputFile) {
      throw new Error(`Conversion from ${sourceFormat} to ${targetFormat} failed to produce an output file`);
    }
    
    // Return information about the converted file
    return {
      success: true,
      fileName: path.basename(outputFile),
      filePath: outputFile,
      sourceFormat,
      targetFormat,
      usedOcr: outputFile.includes('_ocr.') || false
    };
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}

module.exports = { 
  convertFile,
  mimeToExtension,
  isConversionSupported,
  CONVERSION_MATRIX,
  getExtension,
  isTextBasedFormat,
  convertPdfToText,
  performOcr
};