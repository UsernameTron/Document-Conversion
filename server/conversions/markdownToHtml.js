const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');

/**
 * Converts Markdown file to HTML
 * @param {string} inputFilePath - Path to the input Markdown file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function markdownToHtml(inputFilePath, outputDir) {
  try {
    // Read the Markdown file
    const markdownData = await fs.readFile(inputFilePath, 'utf-8');
    
    // Configure marked options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert line breaks to <br>
      headerIds: true, // Add IDs to headers
      mangle: false, // Don't escape HTML
      pedantic: false, // Don't conform to original markdown spec
      smartLists: true, // Use smart lists
      smartypants: true, // Use smart punctuation
      xhtml: true // Use XHTML compatible closing tags
    });
    
    // Convert to HTML
    const htmlContent = marked.parse(markdownData);
    
    // Create a complete HTML document
    const htmlDocument = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${path.basename(inputFilePath, path.extname(inputFilePath))}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    pre {
      background-color: #f5f5f5;
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      background-color: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1rem;
      margin-left: 0;
      color: #666;
    }
    img {
      max-width: 100%;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 0.5rem;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
    `.trim();
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.html`);
    
    // Write the HTML to disk
    await fs.writeFile(outputFilePath, htmlDocument);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    throw new Error(`Failed to convert Markdown to HTML: ${error.message}`);
  }
}

/**
 * Direct conversion from Markdown to HTML without specifying output directory
 * @param {string} inputPath - Path to the input Markdown file
 * @returns {Promise<string>} - Path to the converted file
 */
async function convertMarkdownToHtml(inputPath) {
  try {
    const markdownData = await fs.readFile(inputPath, 'utf8');
    const htmlContent = marked.parse(markdownData);
    
    // Create a complete HTML document
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted from Markdown</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        pre {
            background-color: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
    
    const outputPath = inputPath.replace(/\.(md|markdown)$/, '.html');
    await fs.writeFile(outputPath, fullHtml);
    
    return outputPath;
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    throw new Error(`Failed to convert Markdown to HTML: ${error.message}`);
  }
}

module.exports = { markdownToHtml, convertMarkdownToHtml };
