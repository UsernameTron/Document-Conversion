const fs = require('fs/promises');
const path = require('path');
const papaparse = require('papaparse');

/**
 * Converts CSV file to JSON
 * @param {string} inputFilePath - Path to the input CSV file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function csvToJson(inputFilePath, outputDir) {
  try {
    // Read the CSV file
    const csvData = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the CSV data
    const result = papaparse.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    
    // Check if there were any errors
    if (result.errors && result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }
    
    // Generate JSON from the parsed data
    const jsonData = JSON.stringify(result.data, null, 2);
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.json`);
    
    // Write the JSON to disk
    await fs.writeFile(outputFilePath, jsonData);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
    throw error;
  }
}
module.exports = { csvToJson };
