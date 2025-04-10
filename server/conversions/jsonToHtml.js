const fs = require('fs/promises');
const path = require('path');

/**
 * Converts a JSON file to HTML
 * @param {string} inputFilePath - Path to the JSON file
 * @param {string} outputDir - Directory to save the HTML file
 * @param {Object} options - Additional conversion options
 * @returns {Promise<string>} - Path to the converted HTML file
 */
async function jsonToHtml(inputFilePath, outputDir, options = {}) {
  try {
    // Read the JSON file
    const jsonContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the JSON
    const data = JSON.parse(jsonContent);
    
    // Process the JSON data based on its structure
    let contentHtml = '';
    
    if (Array.isArray(data)) {
      // It's an array of objects - render as a table
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        contentHtml = generateTableFromArray(data);
      } else {
        // It's an array of primitives
        contentHtml = generateListFromArray(data);
      }
    } else if (typeof data === 'object' && data !== null) {
      // It's an object - render as a definition list
      contentHtml = generateDefinitionList(data);
    } else {
      // It's a primitive value
      contentHtml = `<div class="primitive-value">${escapeHtml(JSON.stringify(data, null, 2))}</div>`;
    }
    
    // Create the full HTML document
    const title = path.basename(inputFilePath, '.json');
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: left;
    }
    th, td {
      padding: 10px;
      border: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    tr:hover {
      background-color: #f2f2f2;
    }
    .container {
      overflow-x: auto;
    }
    .key {
      font-weight: bold;
      color: #0066cc;
    }
    .value {
      margin-left: 10px;
    }
    .nested {
      margin-left: 20px;
      border-left: 2px solid #ddd;
      padding-left: 10px;
    }
    .primitive-value {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    dl {
      margin: 0;
      padding: 0;
    }
    dt {
      font-weight: bold;
      margin-top: 10px;
    }
    dd {
      margin-left: 20px;
    }
    ul, ol {
      margin: 0;
      padding-left: 20px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="container">
    ${contentHtml}
  </div>
  <p>
    <small>Generated from ${path.basename(inputFilePath)} on ${new Date().toLocaleString()}</small>
  </p>
</body>
</html>`;
    
    // Generate output filename
    const outputFilePath = path.join(outputDir, `${title}.html`);
    
    // Write the HTML content to the output file
    await fs.writeFile(outputFilePath, htmlContent);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting JSON to HTML: ${error.message}`);
    throw error;
  }
}

/**
 * Generates an HTML table from an array of objects
 * @param {Array} arr - Array of objects
 * @returns {string} - HTML table
 */
function generateTableFromArray(arr) {
  if (arr.length === 0) {
    return '<p>Empty array</p>';
  }
  
  // Get all unique keys from all objects in the array
  const keys = Array.from(new Set(
    arr.flatMap(obj => Object.keys(obj))
  ));
  
  // Generate the table
  let html = '<table>\n';
  
  // Table header
  html += '  <thead>\n    <tr>\n';
  for (const key of keys) {
    html += `      <th>${escapeHtml(key)}</th>\n`;
  }
  html += '    </tr>\n  </thead>\n';
  
  // Table body
  html += '  <tbody>\n';
  for (const item of arr) {
    html += '    <tr>\n';
    for (const key of keys) {
      const value = item[key];
      if (value === undefined) {
        html += '      <td></td>\n';
      } else if (value === null) {
        html += '      <td><em>null</em></td>\n';
      } else if (typeof value === 'object') {
        html += `      <td>${escapeHtml(JSON.stringify(value))}</td>\n`;
      } else {
        html += `      <td>${escapeHtml(String(value))}</td>\n`;
      }
    }
    html += '    </tr>\n';
  }
  html += '  </tbody>\n</table>';
  
  return html;
}

/**
 * Generates an HTML list from an array of primitive values
 * @param {Array} arr - Array of primitive values
 * @returns {string} - HTML list
 */
function generateListFromArray(arr) {
  if (arr.length === 0) {
    return '<p>Empty array</p>';
  }
  
  let html = '<ol>\n';
  for (const item of arr) {
    if (item === null) {
      html += '  <li><em>null</em></li>\n';
    } else if (typeof item === 'object') {
      html += `  <li>${escapeHtml(JSON.stringify(item))}</li>\n`;
    } else {
      html += `  <li>${escapeHtml(String(item))}</li>\n`;
    }
  }
  html += '</ol>';
  
  return html;
}

/**
 * Generates an HTML definition list from an object
 * @param {Object} obj - Object to convert
 * @param {number} depth - Current nesting depth
 * @returns {string} - HTML definition list
 */
function generateDefinitionList(obj, depth = 0) {
  if (Object.keys(obj).length === 0) {
    return '<p>Empty object</p>';
  }
  
  let html = '<dl>\n';
  
  for (const [key, value] of Object.entries(obj)) {
    html += `  <dt class="key">${escapeHtml(key)}</dt>\n`;
    html += '  <dd class="value">';
    
    if (value === null) {
      html += '<em>null</em>';
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        html += generateTableFromArray(value);
      } else {
        html += generateListFromArray(value);
      }
    } else if (typeof value === 'object') {
      html += '<div class="nested">';
      html += generateDefinitionList(value, depth + 1);
      html += '</div>';
    } else {
      html += escapeHtml(String(value));
    }
    
    html += '</dd>\n';
  }
  
  html += '</dl>';
  
  return html;
}

/**
 * Escapes HTML special characters in a string
 * @param {string} str - The input string
 * @returns {string} - The escaped string
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { jsonToHtml };