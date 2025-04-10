const fs = require('fs/promises');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const mammoth = require('mammoth');

/**
 * Converts DOCX file to PDF
 * @param {string} inputFilePath - Path to the input DOCX file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function docxToPdf(inputFilePath, outputDir) {
  try {
    // Read the DOCX file
    const content = await fs.readFile(inputFilePath);
    
    // Extract text content from DOCX using mammoth
    const result = await mammoth.extractRawText({ buffer: content });
    const text = result.value;
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page to the document
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    // Get the font
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    
    // Set up text options
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 50;
    const pageWidth = page.getWidth() - margin * 2;
    const pageHeight = page.getHeight() - margin * 2;
    
    // Process the text (convert paragraphs to array of lines)
    const paragraphs = text.split(/\n+/);
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
    
    // Add title and basic metadata to the PDF with error handling
    try {
      pdfDoc.setTitle(path.basename(inputFilePath, path.extname(inputFilePath)));
    } catch (e) { console.error('Error setting PDF title:', e); }
    
    try {
      pdfDoc.setAuthor('Document Conversion App');
    } catch (e) { console.error('Error setting PDF author:', e); }
    
    try {
      pdfDoc.setCreator('Document Conversion App');
    } catch (e) { console.error('Error setting PDF creator:', e); }
    
    try {
      pdfDoc.setProducer('pdf-lib');
    } catch (e) { console.error('Error setting PDF producer:', e); }
    
    try {
      pdfDoc.setCreationDate(new Date());
    } catch (e) { console.error('Error setting PDF creation date:', e); }
    
    try {
      pdfDoc.setModificationDate(new Date());
    } catch (e) { console.error('Error setting PDF modification date:', e); }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.pdf`);
    
    // Write the PDF to disk
    await fs.writeFile(outputFilePath, pdfBytes);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting DOCX to PDF:', error);
    throw error;
  }
}

module.exports = { docxToPdf };