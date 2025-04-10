const fs = require('fs/promises');
const path = require('path');

/**
 * Converts a text file to HTML
 * @param {string} inputFilePath - Path to the text file
 * @param {string} outputDir - Directory to save the HTML file
 * @param {Object} options - Additional conversion options
 * @returns {Promise<string>} - Path to the converted HTML file
 */
async function txtToHtml(inputFilePath, outputDir, options = {}) {
  try {
    // Read the input file
    const textContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Escape HTML special characters
    const escapedContent = textContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Convert newlines to <br> tags and maintain paragraphs
    const htmlBody = escapedContent
      .split(/\n\n+/)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('\n');
    
    // Create a complete HTML document with proper styling
    const fileName = path.basename(inputFilePath, '.txt');
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${fileName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h1>${fileName}</h1>
  ${htmlBody}
  <hr>
  <footer>
    <small>Converted from ${path.basename(inputFilePath)} on ${new Date().toLocaleString()}</small>
  </footer>
</body>
</html>`;
    
    // Create output file path
    const outputFilePath = path.join(outputDir, `${fileName}.html`);
    
    // Write the HTML content to the output file
    await fs.writeFile(outputFilePath, htmlContent);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting TXT to HTML: ${error.message}`);
    throw error;
  }
}

module.exports = { txtToHtml };