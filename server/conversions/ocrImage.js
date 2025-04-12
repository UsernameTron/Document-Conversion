const fs = require('fs').promises;
const path = require('path');
const tesseract = require('tesseract.js');

/**
 * Performs OCR on image files to extract text
 * @param {string} inputFilePath - Path to the input image file
 * @param {string} outputDir - Directory to save the output file
 * @param {Object} options - OCR options
 * @param {string} options.language - OCR language (e.g., 'eng', 'fra', etc.)
 * @returns {Promise<string>} - Path to the converted file
 */
async function ocrImage(inputFilePath, outputDir, options = { language: 'eng' }) {
  try {
    console.log(`Running OCR on ${inputFilePath} with language: ${options.language}`);
    
    // Read the image file as buffer
    const imageBuffer = await fs.readFile(inputFilePath);
    
    // Perform OCR using Tesseract.js v6 API
    console.log(`OCR: Processing image with language ${options.language}`);
    
    const result = await tesseract.recognize(
      imageBuffer,
      options.language
    );
    
    // Extract the recognized text
    const text = result.data.text;
    
    // Get confidence data (average word confidence)
    const confidence = result.data.confidence || 'Unknown';
    
    // Add some metadata to the output file
    const outputText = `# OCR Result from ${path.basename(inputFilePath)}
    
Confidence: ${confidence}%

## Extracted Text:

${text}

---
Generated on: ${new Date().toISOString()}
OCR Engine: Tesseract.js
Language: ${options.language}
`;
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.txt`);
    
    // Write the text to disk
    await fs.writeFile(outputFilePath, outputText);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error performing OCR on image:', error);
    
    // Create an error output file instead of throwing
    try {
      const errorMessage = `
# OCR PROCESSING ERROR

An error occurred while attempting to perform OCR on ${path.basename(inputFilePath)}:

${error.message}

This may be due to:
- An unsupported image format
- A corrupted image file
- Memory limitations during processing
- Missing OCR language data

Please try one of the following solutions:
1. Convert the image to a different format (PNG or JPEG)
2. Check that the image is not corrupted
3. Reduce the image resolution if it's very large

Error details:
${error.stack || error.message}

Generated on: ${new Date().toISOString()}
`;
      
      const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
      const outputFilePath = path.join(outputDir, `${inputFileName}_ocr_error.txt`);
      
      await fs.writeFile(outputFilePath, errorMessage);
      
      return outputFilePath;
    } catch (writeError) {
      // If even writing the error file fails, we have to throw
      throw new Error(`OCR failed: ${error.message}. Additionally, error file could not be written: ${writeError.message}`);
    }
  }
}

/**
 * Simple OCR function that works directly with a file path
 * @param {string} imagePath - Path to the image file
 * @param {string} language - OCR language (default: 'eng')
 * @returns {Promise<string>} - The extracted text
 */
async function performOcr(imagePath, language = 'eng') {
  try {
    const worker = await tesseract.createWorker();
    await worker.loadLanguage(language);
    await worker.initialize(language);
    
    const { data } = await worker.recognize(imagePath);
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

module.exports = { ocrImage, performOcr };
