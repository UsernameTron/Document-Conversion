const fs = require('fs/promises');
const path = require('path');
const xlsx = require('xlsx');

/**
 * Converts Excel file to CSV
 * @param {string} inputFilePath - Path to the input Excel file
 * @param {string} outputDir - Directory to save the output file
 * @param {Object} options - Conversion options
 * @param {number} options.sheetIndex - Index of the sheet to convert (default: 0)
 * @returns {Promise<string>} - Path to the converted file
 */
async function excelToCsv(inputFilePath, outputDir, options = { sheetIndex: 0 }) {
  try {
    // Read the Excel file
    const buffer = await fs.readFile(inputFilePath);
    
    // Parse the workbook
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    // Get the sheet names
    const sheetNames = workbook.SheetNames;
    
    // Validate sheet index
    if (options.sheetIndex < 0 || options.sheetIndex >= sheetNames.length) {
      throw new Error(`Invalid sheet index: ${options.sheetIndex}. File has ${sheetNames.length} sheets.`);
    }
    
    // Get the sheet name
    const sheetName = sheetNames[options.sheetIndex];
    
    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to CSV
    const csv = xlsx.utils.sheet_to_csv(worksheet);
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}_${sheetName}.csv`);
    
    // Write the CSV to disk
    await fs.writeFile(outputFilePath, csv);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting Excel to CSV:', error);
    throw error;
  }
}
module.exports = { excelToCsv };
