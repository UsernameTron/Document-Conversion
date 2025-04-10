const fs = require('fs/promises');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Converts HTML file to plain text
 * @param {string} inputFilePath - Path to the input HTML file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function htmlToText(inputFilePath, outputDir) {
  try {
    // Read the HTML file
    const htmlContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the HTML
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Extract the text content
    let title = document.querySelector('title')?.textContent || path.basename(inputFilePath, '.html');
    
    // Extract text from specific elements
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(el => `${el.textContent.trim()}`)
      .join('\n\n');
    
    const paragraphs = Array.from(document.querySelectorAll('p'))
      .map(el => el.textContent.trim())
      .join('\n\n');
    
    const lists = Array.from(document.querySelectorAll('ul, ol'))
      .map(list => {
        const items = Array.from(list.querySelectorAll('li'))
          .map(item => `- ${item.textContent.trim()}`)
          .join('\n');
        return items;
      })
      .join('\n\n');
    
    // Combine all content
    let text = title ? `${title}\n${'='.repeat(title.length)}\n\n` : '';
    
    if (headings) {
      text += `${headings}\n\n`;
    }
    
    if (paragraphs) {
      text += `${paragraphs}\n\n`;
    }
    
    if (lists) {
      text += `${lists}\n\n`;
    }
    
    // If the structured approach didn't work well, fall back to the body text
    if (!text.trim() || text.length < 100) {
      text = document.body.textContent.trim()
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n\n');
    }
    
    // Add conversion information
    text += `\n\n---\nConverted from HTML: ${path.basename(inputFilePath)}\nConversion date: ${new Date().toISOString()}`;
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.txt`);
    
    // Write the text to disk
    await fs.writeFile(outputFilePath, text);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting HTML to text:', error);
    throw error;
  }
}

module.exports = { htmlToText };