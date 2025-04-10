const fs = require('fs/promises');
const path = require('path');
const { createWorker } = require('tesseract.js');

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
    
    // Perform OCR using Tesseract.js with worker
    const worker = await createWorker(options.language);
    await worker.loadLanguage(options.language);
    await worker.initialize(options.language);
    
    console.log(`OCR: Processing image with language ${options.language}`);
    const { data } = await worker.recognize(imageBuffer);
    
    // Extract the recognized text
    const text = data.text;
    
    // Get confidence data (average word confidence)
    const confidence = data.confidence || 'Unknown';
    
    // Terminate the worker
    await worker.terminate();
    
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
    throw error;
  }
}
module.exports = { ocrImage };
