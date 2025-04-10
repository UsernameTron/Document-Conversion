const fs = require('fs/promises');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Converts HTML file to Markdown
 * @param {string} inputFilePath - Path to the input HTML file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function htmlToMarkdown(inputFilePath, outputDir) {
  try {
    // Read the HTML file
    const htmlData = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the HTML with JSDOM
    const dom = new JSDOM(htmlData);
    const document = dom.window.document;
    
    // Simple HTML to Markdown converter
    // This is a basic implementation, in a production app you'd use a more robust library
    let markdown = '';
    
    // Helper function to convert HTML elements to Markdown
    function processNode(node, depth = 0) {
      if (!node) return '';
      
      let result = '';
      const nodeName = node.nodeName.toLowerCase();
      
      // Process based on node type
      switch (nodeName) {
        case '#text':
          result += node.textContent;
          break;
          
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          // Extract heading level number
          const level = parseInt(nodeName.substring(1));
          result += `\n${'#'.repeat(level)} ${node.textContent.trim()}\n\n`;
          break;
          
        case 'p':
          if (node.textContent.trim()) {
            result += `\n${node.textContent.trim()}\n\n`;
          }
          break;
          
        case 'br':
          result += '\n';
          break;
          
        case 'hr':
          result += '\n---\n\n';
          break;
          
        case 'a':
          const href = node.getAttribute('href');
          if (href) {
            result += `[${node.textContent.trim()}](${href})`;
          } else {
            result += node.textContent.trim();
          }
          break;
          
        case 'strong':
        case 'b':
          result += `**${node.textContent.trim()}**`;
          break;
          
        case 'em':
        case 'i':
          result += `*${node.textContent.trim()}*`;
          break;
          
        case 'code':
          result += `\`${node.textContent.trim()}\``;
          break;
          
        case 'pre':
          result += `\n\`\`\`\n${node.textContent.trim()}\n\`\`\`\n\n`;
          break;
          
        case 'ul':
        case 'ol':
          result += '\n';
          // Process child list items
          for (const child of node.childNodes) {
            if (child.nodeName.toLowerCase() === 'li') {
              const prefix = nodeName === 'ul' ? '- ' : '1. ';
              const indentation = '  '.repeat(depth);
              result += `${indentation}${prefix}${processNode(child, depth + 1).trim()}\n`;
            }
          }
          result += '\n';
          return result; // Skip default child processing for lists
          
        case 'li':
          // Only process child nodes for list items
          for (const child of node.childNodes) {
            result += processNode(child, depth);
          }
          break;
          
        case 'img':
          const src = node.getAttribute('src');
          const alt = node.getAttribute('alt') || '';
          if (src) {
            result += `![${alt}](${src})`;
          }
          break;
          
        case 'blockquote':
          result += '\n> ' + node.textContent.trim().replace(/\n/g, '\n> ') + '\n\n';
          break;
          
        case 'table':
          // Tables are complex to convert perfectly, this is a simple version
          result += '\n';
          const rows = node.querySelectorAll('tr');
          let isFirstRow = true;
          
          for (const row of rows) {
            const cells = row.querySelectorAll('th, td');
            const rowContent = Array.from(cells).map(cell => cell.textContent.trim());
            
            result += '| ' + rowContent.join(' | ') + ' |\n';
            
            // Add separator after header row
            if (isFirstRow) {
              result += '| ' + rowContent.map(() => '---').join(' | ') + ' |\n';
              isFirstRow = false;
            }
          }
          
          result += '\n';
          break;
          
        default:
          // Process child nodes for elements not explicitly handled
          for (const child of node.childNodes) {
            result += processNode(child, depth);
          }
      }
      
      return result;
    }
    
    // Process the body
    const body = document.querySelector('body');
    if (body) {
      markdown = processNode(body);
    } else {
      // Fallback to entire document if body isn't found
      markdown = processNode(document);
    }
    
    // Clean up the markdown
    markdown = markdown
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with at most two
      .trim();
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.md`);
    
    // Write the Markdown to disk
    await fs.writeFile(outputFilePath, markdown);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    throw error;
  }
}
module.exports = { htmlToMarkdown };
