const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');

/**
 * Converts a DOCX file to Markdown
 * @param {string} inputFilePath - Path to the DOCX file
 * @param {string} outputDir - Directory to save the Markdown file
 * @param {Object} options - Additional conversion options
 * @returns {Promise<string>} - Path to the converted Markdown file
 */
async function docxToMarkdown(inputFilePath, outputDir, options = {}) {
  try {
    // Read the input file
    const buffer = await fs.readFile(inputFilePath);
    
    // Use mammoth to extract text and convert to HTML
    const htmlResult = await mammoth.convertToHtml({ buffer });
    
    // Basic HTML to Markdown conversion
    // In a production app, you'd use a dedicated HTML-to-MD converter
    let markdown = '';
    
    // Extract document title from filename
    const fileName = path.basename(inputFilePath, path.extname(inputFilePath));
    markdown += `# ${fileName}\n\n`;
    
    // Very simple HTML to Markdown conversion (just for demonstration)
    const html = htmlResult.value;
    
    // Replace common HTML elements with Markdown
    let mdContent = html
      // Headers
      .replace(/<h1>(.*?)<\/h1>/g, '\n# $1\n')
      .replace(/<h2>(.*?)<\/h2>/g, '\n## $1\n')
      .replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n')
      .replace(/<h4>(.*?)<\/h4>/g, '\n#### $1\n')
      .replace(/<h5>(.*?)<\/h5>/g, '\n##### $1\n')
      .replace(/<h6>(.*?)<\/h6>/g, '\n###### $1\n')
      
      // Paragraphs
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      
      // Bold and Italic
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<b>(.*?)<\/b>/g, '**$1**')
      .replace(/<i>(.*?)<\/i>/g, '*$1*')
      
      // Lists
      .replace(/<ul>(.*?)<\/ul>/g, '$1\n')
      .replace(/<ol>(.*?)<\/ol>/g, '$1\n')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      
      // Links
      .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
      
      // Images
      .replace(/<img src="(.*?)" alt="(.*?)".*?>/g, '![$2]($1)')
      
      // Code
      .replace(/<pre><code>(.*?)<\/code><\/pre>/g, '```\n$1\n```\n')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      
      // Horizontal rule
      .replace(/<hr\s*\/?>/, '\n---\n')
      
      // Strip remaining HTML tags
      .replace(/<[^>]*>/g, '')
      
      // Fix whitespace
      .replace(/&nbsp;/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
    
    // Combine content
    markdown += mdContent;
    
    // Add generation info
    markdown += `\n\n---\nConverted from ${path.basename(inputFilePath)} on ${new Date().toLocaleString()}\n`;
    
    // Create output file path
    const outputFilePath = path.join(outputDir, `${fileName}.md`);
    
    // Write the markdown content to the output file
    await fs.writeFile(outputFilePath, markdown);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting DOCX to Markdown: ${error.message}`);
    throw error;
  }
}

module.exports = { docxToMarkdown };