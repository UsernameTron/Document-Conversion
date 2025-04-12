const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');

/**
 * Converts CSV file to JSON with output directory
 * @param {string} inputFilePath - Path to the input CSV file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function csvToJson(inputFilePath, outputDir) {
  try {
    const csvData = await fs.readFile(inputFilePath, 'utf8');
    
    // Parse CSV with header option enabled
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.json`);
    
    // Write the JSON to disk
    await fs.writeFile(outputFilePath, JSON.stringify(result.data, null, 2));
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
    throw new Error(`Failed to convert CSV to JSON: ${error.message}`);
  }
}

/**
 * Converts CSV to JSON without specifying output directory
 * @param {string} inputPath - Path to the input CSV file
 * @returns {Promise<string>} - Path to the converted file
 */
async function convertCsvToJson(inputPath) {
  try {
    const csvData = await fs.readFile(inputPath, 'utf8');
    
    // Parse CSV with header option enabled
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    
    const outputPath = inputPath.replace(/\.csv$/, '.json');
    await fs.writeFile(outputPath, JSON.stringify(result.data, null, 2));
    
    return outputPath;
  } catch (error) {
    console.error('Error converting CSV to JSON:', error);
    throw new Error(`Failed to convert CSV to JSON: ${error.message}`);
  }
}

module.exports = { csvToJson, convertCsvToJson };