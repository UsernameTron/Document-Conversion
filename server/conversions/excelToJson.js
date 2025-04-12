const fs = require('fs').promises;
const path = require('path');
const xlsx = require('xlsx');

/**
 * Converts Excel file to JSON
 * @param {string} inputFilePath - Path to the input Excel file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function excelToJson(inputFilePath, outputDir) {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(inputFilePath);
    
    // Get all sheets
    const result = {};
    workbook.SheetNames.forEach(sheetName => {
      // Convert sheet to JSON
      const sheet = workbook.Sheets[sheetName];
      result[sheetName] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      
      // Try to determine if the first row is headers
      // If all values in first row are strings, treat as headers
      if (result[sheetName].length > 0) {
        const firstRow = result[sheetName][0];
        const allStrings = firstRow.every(cell => typeof cell === 'string');
        
        if (allStrings) {
          // Re-parse with headers
          result[sheetName] = xlsx.utils.sheet_to_json(sheet);
        }
      }
    });
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.json`);
    
    // Write the JSON to disk
    await fs.writeFile(outputFilePath, JSON.stringify(result, null, 2));
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting Excel to JSON:', error);
    throw error;
  }
}

module.exports = { excelToJson };