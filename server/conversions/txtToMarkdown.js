const fs = require('fs').promises;
const path = require('path');

/**
 * Converts a text file to Markdown
 * @param {string} inputFilePath - Path to the text file
 * @param {string} outputDir - Directory to save the Markdown file
 * @param {Object} options - Additional conversion options
 * @returns {Promise<string>} - Path to the converted Markdown file
 */
async function txtToMarkdown(inputFilePath, outputDir, options = {}) {
  try {
    // Read the input file
    const textContent = await fs.readFile(inputFilePath, 'utf8');
    
    // Extract file name without extension
    const fileName = path.basename(inputFilePath, path.extname(inputFilePath));
    
    // Convert text to markdown with some basic formatting
    // This is a simple conversion that adds a title and formats paragraphs
    
    // Get the first line as title (or use filename if no content)
    const lines = textContent.split('\n').filter(line => line.trim());
    const title = lines.length > 0 ? lines[0].trim() : fileName;
    
    // Build markdown content
    let markdown = `# ${title}\n\n`;
    
    // Process the content line by line, assuming paragraphs are separated by blank lines
    let currentParagraph = [];
    let inList = false;
    let inCodeBlock = false;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip the line if it's part of the title (already processed)
      if (i === 0) continue;
      
      // Check for code blocks (lines starting with 4 spaces or a tab)
      if ((line.startsWith('    ') || line.startsWith('\t')) && !inCodeBlock) {
        // If we were building a paragraph, close it
        if (currentParagraph.length > 0) {
          markdown += `${currentParagraph.join(' ')}\n\n`;
          currentParagraph = [];
        }
        
        if (!inCodeBlock) {
          markdown += "```\n";
          inCodeBlock = true;
        }
        
        // Add code line without the indentation
        markdown += line.replace(/^( {4}|\t)/, '') + '\n';
        continue;
      }
      // End of code block
      else if (inCodeBlock && !(line.startsWith('    ') || line.startsWith('\t'))) {
        markdown += "```\n\n";
        inCodeBlock = false;
      }
      
      // Check for list items (lines starting with - or * or number.)
      if ((trimmedLine.match(/^[\-\*]\s/) || trimmedLine.match(/^\d+\.\s/)) && !inList) {
        // If we were building a paragraph, close it
        if (currentParagraph.length > 0) {
          markdown += `${currentParagraph.join(' ')}\n\n`;
          currentParagraph = [];
        }
        
        inList = true;
        markdown += `${trimmedLine}\n`;
      }
      // Continue list
      else if (inList && (trimmedLine.match(/^[\-\*]\s/) || trimmedLine.match(/^\d+\.\s/))) {
        markdown += `${trimmedLine}\n`;
      }
      // End of list
      else if (inList && trimmedLine === '') {
        markdown += '\n';
        inList = false;
      }
      // Regular paragraph content
      else if (!inList && !inCodeBlock) {
        // Empty line indicates paragraph break
        if (trimmedLine === '') {
          if (currentParagraph.length > 0) {
            markdown += `${currentParagraph.join(' ')}\n\n`;
            currentParagraph = [];
          }
        } else {
          currentParagraph.push(trimmedLine);
        }
      }
    }
    
    // Close any open elements
    if (inCodeBlock) {
      markdown += "```\n\n";
    }
    
    if (currentParagraph.length > 0) {
      markdown += `${currentParagraph.join(' ')}\n\n`;
    }
    
    // Add a footer
    markdown += `---\nConverted from ${path.basename(inputFilePath)} on ${new Date().toLocaleString()}\n`;
    
    // Create output file path
    const outputFilePath = path.join(outputDir, `${fileName}.md`);
    
    // Write the markdown content to the output file
    await fs.writeFile(outputFilePath, markdown);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting TXT to Markdown: ${error.message}`);
    throw error;
  }
}

module.exports = { txtToMarkdown };