const fs = require('fs/promises');
const path = require('path');
const papaparse = require('papaparse');

/**
 * Converts JSON file to CSV
 * @param {string} inputFilePath - Path to the input JSON file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function jsonToCsv(inputFilePath, outputDir) {
  try {
    // Read the JSON file
    const jsonData = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the JSON data
    const data = JSON.parse(jsonData);
    
    // Check if it's an array (required for CSV conversion)
    // If it's not an array but an object, convert it to an array with one item
    let dataArray = data;
    if (!Array.isArray(data)) {
      if (typeof data === 'object' && data !== null) {
        // Convert object to array for CSV conversion
        dataArray = [data];
      } else {
        throw new Error('JSON data must be an object or an array of objects to convert to CSV');
      }
    }
    
    // Check if array is empty
    if (dataArray.length === 0) {
      throw new Error('JSON array is empty');
    }
    
    // Convert to CSV
    const csvData = papaparse.unparse(dataArray, {
      header: true,
      newline: '\n'
    });
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.csv`);
    
    // Write the CSV to disk
    await fs.writeFile(outputFilePath, csvData);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting JSON to CSV:', error);
    throw error;
  }
}
module.exports = { jsonToCsv };
