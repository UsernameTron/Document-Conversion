const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs/promises');
const path = require('path');

/**
 * Converts text file to PDF
 * @param {string} inputFilePath - Path to the input text file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function textToPdf(inputFilePath, outputDir) {
  try {
    // Read the text file
    const text = await fs.readFile(inputFilePath, 'utf-8');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page to the document
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Get the font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Set up text options
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 50;
    const pageWidth = page.getWidth() - margin * 2;
    const pageHeight = page.getHeight() - margin * 2;
    
    // Split text into lines
    const words = text.split(/\s+/);
    let lines = [];
    let currentLine = [];
    
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
    
    // Split lines into pages
    const linesPerPage = Math.floor(pageHeight / lineHeight);
    const pages = [];
    
    for (let i = 0; i < lines.length; i += linesPerPage) {
      pages.push(lines.slice(i, i + linesPerPage));
    }
    
    // Add text to the first page with error handling
    if (pages.length > 0) {
      const firstPageLines = pages[0];
      for (let i = 0; i < firstPageLines.length; i++) {
        try {
          // Ensure the text is valid and not null
          const lineText = String(firstPageLines[i] || '');
          if (lineText.trim()) {
            page.drawText(lineText, {
              x: margin,
              y: page.getHeight() - margin - (i + 1) * lineHeight,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
        } catch (drawError) {
          console.error(`Error drawing text on page 1, line ${i}:`, drawError);
          // Continue with other lines
        }
      }
    }
    
    // Add additional pages if needed
    for (let i = 1; i < pages.length; i++) {
      try {
        const newPage = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const pageLines = pages[i];
        
        for (let j = 0; j < pageLines.length; j++) {
          try {
            // Ensure the text is valid and not null
            const lineText = String(pageLines[j] || '');
            if (lineText.trim()) {
              newPage.drawText(lineText, {
                x: margin,
                y: newPage.getHeight() - margin - (j + 1) * lineHeight,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
              });
            }
          } catch (drawError) {
            console.error(`Error drawing text on page ${i+1}, line ${j}:`, drawError);
            // Continue with other lines
          }
        }
      } catch (pageError) {
        console.error(`Error creating page ${i+1}:`, pageError);
        // Continue with other pages
      }
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.pdf`);
    
    // Write the PDF to disk
    await fs.writeFile(outputFilePath, pdfBytes);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting text to PDF:', error);
    throw error;
  }
}

module.exports = { textToPdf };