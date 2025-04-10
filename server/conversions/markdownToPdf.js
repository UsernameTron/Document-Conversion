const fs = require('fs/promises');
const path = require('path');
const { marked } = require('marked');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { JSDOM } = require('jsdom');

/**
 * Converts a Markdown file to PDF
 * @param {string} inputFilePath - Path to the Markdown file
 * @param {string} outputDir - Directory to save the PDF file
 * @returns {Promise<string>} - Path to the converted file
 */
async function markdownToPdf(inputFilePath, outputDir) {
  try {
    // Read the Markdown file
    const markdownContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Convert Markdown to HTML
    const html = marked.parse(markdownContent);
    
    // Use JSDOM to parse the HTML 
    const dom = new JSDOM(`<!DOCTYPE html><div id="content">${html}</div>`);
    const document = dom.window.document;
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
    
    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Set up text options
    const margin = 50;
    const pageWidth = page.getWidth() - margin * 2;
    let currentY = page.getHeight() - margin;
    const lineHeight = {
      h1: 24,
      h2: 18,
      h3: 16,
      p: 14,
      li: 14,
      code: 12
    };
    
    // Process headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const heading of headings) {
      const tagName = heading.tagName.toLowerCase();
      const fontSize = tagName === 'h1' ? 24 : tagName === 'h2' ? 18 : 16;
      
      // Check if we need a new page
      if (currentY < margin + fontSize) {
        page = pdfDoc.addPage([595.28, 841.89]);
        currentY = page.getHeight() - margin;
      }
      
      // Draw the heading text
      page.drawText(heading.textContent.trim(), {
        x: margin,
        y: currentY,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      currentY -= lineHeight[tagName] * 1.5;
    }
    
    // Process paragraphs
    const paragraphs = document.querySelectorAll('p');
    for (const paragraph of paragraphs) {
      const text = paragraph.textContent.trim();
      
      // Split text into lines that fit on the page
      const words = text.split(/\s+/);
      let currentLine = [];
      let lines = [];
      
      for (const word of words) {
        currentLine.push(word);
        const lineText = currentLine.join(' ');
        const lineWidth = regularFont.widthOfTextAtSize(lineText, 12);
        
        if (lineWidth > pageWidth) {
          currentLine.pop();
          lines.push(currentLine.join(' '));
          currentLine = [word];
        }
      }
      
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
      }
      
      // Draw each line of the paragraph
      for (const line of lines) {
        // Check if we need a new page
        if (currentY < margin + 12) {
          page = pdfDoc.addPage([595.28, 841.89]);
          currentY = page.getHeight() - margin;
        }
        
        page.drawText(line, {
          x: margin,
          y: currentY,
          size: 12,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        
        currentY -= lineHeight.p;
      }
      
      // Add extra space after paragraphs
      currentY -= 10;
    }
    
    // Process lists
    const lists = document.querySelectorAll('ul, ol');
    for (const list of lists) {
      const items = list.querySelectorAll('li');
      
      for (const item of items) {
        const text = `• ${item.textContent.trim()}`;
        
        // Split text into lines that fit on the page
        const words = text.split(/\s+/);
        let currentLine = [];
        let lines = [];
        
        for (const word of words) {
          currentLine.push(word);
          const lineText = currentLine.join(' ');
          const lineWidth = regularFont.widthOfTextAtSize(lineText, 12);
          
          if (lineWidth > pageWidth - 20) { // Indent list items
            currentLine.pop();
            lines.push(currentLine.join(' '));
            currentLine = ['  ' + word]; // Indent continuation lines
          }
        }
        
        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '));
        }
        
        // Draw each line of the list item
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Check if we need a new page
          if (currentY < margin + 12) {
            page = pdfDoc.addPage([595.28, 841.89]);
            currentY = page.getHeight() - margin;
          }
          
          page.drawText(line, {
            x: margin + (i === 0 ? 0 : 10), // Indent continuation lines
            y: currentY,
            size: 12,
            font: regularFont,
            color: rgb(0, 0, 0),
          });
          
          currentY -= lineHeight.li;
        }
      }
      
      // Add extra space after lists
      currentY -= 10;
    }
    
    // Process code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    for (const codeBlock of codeBlocks) {
      const text = codeBlock.textContent.trim();
      const lines = text.split('\n');
      
      // Draw a background rectangle for the code block
      page.drawRectangle({
        x: margin - 5,
        y: currentY - lineHeight.code * lines.length - 10,
        width: pageWidth + 10,
        height: lineHeight.code * lines.length + 10,
        color: rgb(0.95, 0.95, 0.95),
      });
      
      // Draw each line of the code block
      for (const line of lines) {
        // Check if we need a new page
        if (currentY < margin + 12) {
          page = pdfDoc.addPage([595.28, 841.89]);
          currentY = page.getHeight() - margin;
        }
        
        page.drawText(line, {
          x: margin,
          y: currentY,
          size: 10,
          font: monoFont,
          color: rgb(0.1, 0.1, 0.1),
        });
        
        currentY -= lineHeight.code;
      }
      
      // Add extra space after code blocks
      currentY -= 15;
    }
    
    // Add title and metadata
    const title = path.basename(inputFilePath, path.extname(inputFilePath));
    pdfDoc.setTitle(title);
    pdfDoc.setAuthor('Document Conversion App');
    pdfDoc.setCreator('Document Conversion App');
    pdfDoc.setProducer('Document Conversion App using pdf-lib');
    pdfDoc.setCreationDate(new Date());
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Write to file
    const outputFilePath = path.join(outputDir, `${title}.pdf`);
    await fs.writeFile(outputFilePath, pdfBytes);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting Markdown to PDF: ${error.message}`);
    throw error;
  }
}

module.exports = { markdownToPdf };