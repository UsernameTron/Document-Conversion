const fs = require('fs/promises');
const path = require('path');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');

/**
 * Converts a Markdown file to plain text
 * @param {string} inputFilePath - Path to the Markdown file
 * @param {string} outputDir - Directory to save the text file
 * @returns {Promise<string>} - Path to the converted file
 */
async function markdownToText(inputFilePath, outputDir) {
  try {
    // Read the Markdown file
    const markdownContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // First convert Markdown to HTML
    const html = marked.parse(markdownContent);
    
    // Use JSDOM to parse the HTML and extract plain text
    const dom = new JSDOM(`<!DOCTYPE html><div id="content">${html}</div>`);
    const document = dom.window.document;
    
    // Get the HTML content
    const contentElement = document.getElementById('content');
    
    // Extract text from specific elements
    const headings = Array.from(contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(el => `${el.textContent.trim()}`)
      .join('\n\n');
    
    const paragraphs = Array.from(contentElement.querySelectorAll('p'))
      .map(el => el.textContent.trim())
      .join('\n\n');
    
    const lists = Array.from(contentElement.querySelectorAll('ul, ol'))
      .map(list => {
        const items = Array.from(list.querySelectorAll('li'))
          .map(item => `- ${item.textContent.trim()}`)
          .join('\n');
        return items;
      })
      .join('\n\n');
    
    const codeBlocks = Array.from(contentElement.querySelectorAll('pre code'))
      .map(code => {
        const content = code.textContent.trim();
        return `\n${content}\n`;
      })
      .join('\n\n');
    
    // Combine all content
    let textContent = '';
    
    if (headings) {
      textContent += `${headings}\n\n`;
    }
    
    if (paragraphs) {
      textContent += `${paragraphs}\n\n`;
    }
    
    if (lists) {
      textContent += `${lists}\n\n`;
    }
    
    if (codeBlocks) {
      textContent += `${codeBlocks}\n\n`;
    }
    
    // If the structured approach didn't get much, fall back to all text
    if (!textContent.trim() || textContent.length < 50) {
      textContent = contentElement.textContent
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n\n')
        .trim();
    }
    
    // Add conversion information
    textContent += `\n\n---\nConverted from Markdown: ${path.basename(inputFilePath)}\nConversion date: ${new Date().toISOString()}`;
    
    // Generate output filename
    const baseFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${baseFileName}.txt`);
    
    // Write the text content to the output file
    await fs.writeFile(outputFilePath, textContent);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting Markdown to text: ${error.message}`);
    throw error;
  }
}

module.exports = { markdownToText };