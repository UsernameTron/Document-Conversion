const mammoth = require('mammoth');
const fs = require('fs/promises');
const path = require('path');

/**
 * Converts a DOCX file to HTML
 * @param {string} inputFilePath - Path to the DOCX file
 * @param {string} outputDir - Directory to save the HTML file
 * @param {Object} options - Additional conversion options
 * @returns {Promise<string>} - Path to the converted HTML file
 */
async function docxToHtml(inputFilePath, outputDir, options = {}) {
  try {
    // Read the input file
    const buffer = await fs.readFile(inputFilePath);
    
    // Use mammoth for DOCX to HTML conversion
    const result = await mammoth.convertToHtml({ buffer });
    
    // Create a complete HTML document with proper styling
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${path.basename(inputFilePath, '.docx')}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    td, th {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  ${result.value}
  <hr>
  <footer>
    <small>Converted from ${path.basename(inputFilePath)} on ${new Date().toLocaleString()}</small>
  </footer>
</body>
</html>`;
    
    // Extract file name without extension
    const fileName = path.basename(inputFilePath, path.extname(inputFilePath));
    
    // Create output file path
    const outputFilePath = path.join(outputDir, `${fileName}.html`);
    
    // Write the HTML content to the output file
    await fs.writeFile(outputFilePath, htmlContent);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting DOCX to HTML: ${error.message}`);
    throw error;
  }
}

module.exports = { docxToHtml };