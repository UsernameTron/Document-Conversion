const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');

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
        // Handle nested objects by flattening them
        if (Object.values(data).some(val => typeof val === 'object' && val !== null)) {
          dataArray = [flattenObject(data)];
        } else {
          dataArray = [data];
        }
      } else {
        throw new Error('JSON data must be an object or an array of objects to convert to CSV');
      }
    }
    
    // Check if array is empty
    if (dataArray.length === 0) {
      throw new Error('JSON array is empty');
    }
    
    // Convert to CSV
    const csvData = Papa.unparse(dataArray, {
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
    throw new Error(`Failed to convert JSON to CSV: ${error.message}`);
  }
}

/**
 * Directly converts JSON to CSV without specifying output directory
 * @param {string} inputPath - Path to the input JSON file
 * @returns {Promise<string>} - Path to the converted file
 */
async function convertJsonToCsv(inputPath) {
  try {
    const jsonData = await fs.readFile(inputPath, 'utf8');
    let data = JSON.parse(jsonData);
    
    // If data is not an array, convert it to an array for CSV conversion
    if (!Array.isArray(data)) {
      if (typeof data === 'object') {
        // Handle nested objects by flattening them
        if (Object.values(data).some(val => typeof val === 'object' && val !== null)) {
          data = [flattenObject(data)];
        } else {
          data = [data];
        }
      } else {
        throw new Error('JSON data is not in a format convertible to CSV');
      }
    }
    
    // Convert to CSV
    const csv = Papa.unparse(data);
    
    const outputPath = inputPath.replace(/\.json$/, '.csv');
    await fs.writeFile(outputPath, csv);
    
    return outputPath;
  } catch (error) {
    console.error('Error converting JSON to CSV:', error);
    throw new Error(`Failed to convert JSON to CSV: ${error.message}`);
  }
}

// Helper function to flatten nested objects
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], `${pre}${k}`));
    } else {
      acc[`${pre}${k}`] = Array.isArray(obj[k]) ? JSON.stringify(obj[k]) : obj[k];
    }
    return acc;
  }, {});
}

module.exports = { jsonToCsv, convertJsonToCsv };
