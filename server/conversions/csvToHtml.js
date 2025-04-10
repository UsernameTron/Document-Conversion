const fs = require('fs/promises');
const path = require('path');
const papaparse = require('papaparse');

/**
 * Converts a CSV file to HTML with table formatting
 * @param {string} inputFilePath - Path to the CSV file
 * @param {string} outputDir - Directory to save the HTML file
 * @param {Object} options - Additional conversion options
 * @returns {Promise<string>} - Path to the converted HTML file
 */
async function csvToHtml(inputFilePath, outputDir, options = {}) {
  try {
    // Read the CSV file
    const csvContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the CSV
    const parseResult = papaparse.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });
    
    // Get the column headers and data
    const headers = parseResult.meta.fields || [];
    const data = parseResult.data || [];
    
    // Generate HTML table
    let tableHtml = '<table border="1" cellpadding="5" cellspacing="0">\n';
    
    // Add table header
    tableHtml += '  <thead>\n    <tr>\n';
    for (const header of headers) {
      tableHtml += `      <th>${escapeHtml(header)}</th>\n`;
    }
    tableHtml += '    </tr>\n  </thead>\n';
    
    // Add table body
    tableHtml += '  <tbody>\n';
    for (const row of data) {
      tableHtml += '    <tr>\n';
      for (const header of headers) {
        const cellValue = row[header] !== undefined && row[header] !== null ? 
          row[header] : '';
        tableHtml += `      <td>${escapeHtml(cellValue.toString())}</td>\n`;
      }
      tableHtml += '    </tr>\n';
    }
    tableHtml += '  </tbody>\n</table>';
    
    // Create the full HTML document
    const title = path.basename(inputFilePath, '.csv');
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
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="container">
    ${tableHtml}
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
    console.error(`Error converting CSV to HTML: ${error.message}`);
    throw error;
  }
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

module.exports = { csvToHtml };