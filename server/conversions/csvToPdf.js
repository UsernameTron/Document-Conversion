const fs = require('fs/promises');
const path = require('path');
const papaparse = require('papaparse');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

/**
 * Converts a CSV file to PDF with table formatting
 * @param {string} inputFilePath - Path to the CSV file
 * @param {string} outputDir - Directory to save the PDF file
 * @param {Object} options - Additional conversion options
 * @returns {Promise<string>} - Path to the converted PDF file
 */
async function csvToPdf(inputFilePath, outputDir, options = {}) {
  try {
    // Read the CSV file
    const csvContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the CSV
    const parseResult = papaparse.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });
    
    // Get the column headers and data
    const headers = parseResult.meta.fields || [];
    const data = parseResult.data || [];
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a page
    const page = pdfDoc.addPage();
    
    // Set up layout parameters
    const margin = 50;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const tableWidth = pageWidth - (margin * 2);
    
    // Calculate column widths (distribute evenly)
    const colWidth = tableWidth / headers.length;
    const fontSize = 10;
    const headerFontSize = 12;
    const rowHeight = 20;
    const maxRowsPerPage = Math.floor((pageHeight - (margin * 2) - rowHeight) / rowHeight);
    
    // Draw title
    const title = path.basename(inputFilePath, '.csv');
    page.drawText(title, {
      x: margin,
      y: pageHeight - margin,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    
    // Draw headers
    let currentY = pageHeight - margin - 30;
    
    // Draw column headers
    for (let i = 0; i < headers.length; i++) {
      page.drawText(headers[i], {
        x: margin + (i * colWidth),
        y: currentY,
        size: headerFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    }
    
    // Draw a line under headers
    page.drawLine({
      start: { x: margin, y: currentY - 5 },
      end: { x: pageWidth - margin, y: currentY - 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    currentY -= rowHeight;
    
    // Draw data rows
    let currentPage = page;
    let rowIndex = 0;
    
    for (const row of data) {
      // Check if we need a new page
      if (rowIndex >= maxRowsPerPage) {
        // Add a new page
        currentPage = pdfDoc.addPage();
        currentY = pageHeight - margin;
        rowIndex = 0;
        
        // Draw column headers on the new page
        for (let i = 0; i < headers.length; i++) {
          currentPage.drawText(headers[i], {
            x: margin + (i * colWidth),
            y: currentY,
            size: headerFontSize,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
        }
        
        // Draw a line under headers
        currentPage.drawLine({
          start: { x: margin, y: currentY - 5 },
          end: { x: pageWidth - margin, y: currentY - 5 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
        
        currentY -= rowHeight;
      }
      
      // Draw the row data
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const value = row[header] !== undefined && row[header] !== null ? 
          row[header].toString() : '';
        
        // Truncate long cell content
        const maxChars = 20;
        const displayValue = value.length > maxChars ? 
          value.substring(0, maxChars) + '...' : value;
        
        currentPage.drawText(displayValue, {
          x: margin + (i * colWidth),
          y: currentY,
          size: fontSize,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      }
      
      // Advance to the next row
      currentY -= rowHeight;
      rowIndex++;
    }
    
    // Add metadata to the PDF
    pdfDoc.setTitle(title);
    pdfDoc.setCreator('Document Conversion App');
    pdfDoc.setProducer('Document Conversion App using pdf-lib');
    pdfDoc.setCreationDate(new Date());
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Generate output filename
    const outputFilePath = path.join(outputDir, `${title}.pdf`);
    
    // Write the PDF to disk
    await fs.writeFile(outputFilePath, pdfBytes);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting CSV to PDF: ${error.message}`);
    throw error;
  }
}

module.exports = { csvToPdf };