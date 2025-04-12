const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');

/**
 * Converts a DOCX file to plain text
 * @param {string} inputFilePath - Path to the DOCX file
 * @param {string} outputDir - Directory to save the text file
 * @param {Object} options - Additional conversion options
 * @returns {Promise<string>} - Path to the converted text file
 */
async function docxToText(inputFilePath, outputDir, options = {}) {
  try {
    // Read the input file
    const buffer = await fs.readFile(inputFilePath);
    
    // Use mammoth to extract text from DOCX
    const result = await mammoth.extractRawText({ buffer });
    
    // Extract file name without extension
    const fileName = path.basename(inputFilePath, path.extname(inputFilePath));
    
    // Create output file path
    const outputFilePath = path.join(outputDir, `${fileName}.txt`);
    
    // Add a header for context
    const textContent = `# Converted from ${path.basename(inputFilePath)}
Generated on: ${new Date().toISOString()}

${result.value}`;
    
    // Write the text content to the output file
    await fs.writeFile(outputFilePath, textContent);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting DOCX to text: ${error.message}`);
    throw error;
  }
}

module.exports = { docxToText };