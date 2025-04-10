const fs = require('fs/promises');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { JSDOM } = require('jsdom');

/**
 * Converts HTML file to PDF
 * @param {string} inputFilePath - Path to the input HTML file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function htmlToPdf(inputFilePath, outputDir) {
  try {
    // Read the HTML file
    const htmlContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the HTML
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Extract text content (simplified approach)
    // In a production app, you'd want to use a more sophisticated HTML to PDF renderer
    let title = document.querySelector('title')?.textContent || path.basename(inputFilePath, '.html');
    
    // Get text content
    const bodyText = document.body.textContent.trim();
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page to the document
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Get the font
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Set up text options
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 50;
    const pageWidth = page.getWidth() - margin * 2;
    
    // Draw title
    page.drawText(title, {
      x: margin,
      y: page.getHeight() - margin,
      size: fontSize * 1.5,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    // Process the text (convert to array of lines)
    const paragraphs = bodyText.split(/\n+/);
    let lines = [];
    
    for (const paragraph of paragraphs) {
      // Skip empty paragraphs
      if (!paragraph.trim()) {
        lines.push('');
        continue;
      }
      
      // Split paragraph into words
      const words = paragraph.split(/\s+/);
      let currentLine = [];
      
      // Create lines with proper width
      for (const word of words) {
        currentLine.push(word);
        const lineText = currentLine.join(' ');
        const lineWidth = font.widthOfTextAtSize(lineText, fontSize);
        
        if (lineWidth > pageWidth) {
          currentLine.pop();
          lines.push(currentLine.join(' '));
          currentLine = [word];
        }
      }
      
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
      }
      
      // Add an empty line between paragraphs
      lines.push('');
    }
    
    // Draw content text with error handling
    for (let i = 0; i < Math.min(lines.length, 50); i++) { // Limit to 50 lines for this example
      try {
        const lineText = String(lines[i] || '');
        if (lineText.trim()) {
          page.drawText(lineText, {
            x: margin,
            y: page.getHeight() - margin - (i + 3) * lineHeight, // +3 to leave space for title
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
      } catch (drawError) {
        console.error(`Error drawing text line ${i}:`, drawError);
      }
    }
    
    // Add metadata to the PDF
    try { pdfDoc.setTitle(title); } catch (e) {}
    try { pdfDoc.setAuthor('Document Conversion App'); } catch (e) {}
    try { pdfDoc.setCreator('Document Conversion App'); } catch (e) {}
    try { pdfDoc.setProducer('pdf-lib'); } catch (e) {}
    try { pdfDoc.setCreationDate(new Date()); } catch (e) {}
    try { pdfDoc.setModificationDate(new Date()); } catch (e) {}
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.pdf`);
    
    // Write the PDF to disk
    await fs.writeFile(outputFilePath, pdfBytes);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    throw error;
  }
}

module.exports = { htmlToPdf };