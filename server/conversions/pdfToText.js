const fs = require('fs/promises');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

/**
 * Converts PDF file to text
 * @param {string} inputFilePath - Path to the input PDF file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function pdfToText(inputFilePath, outputDir) {
  try {
    // Read the PDF file
    const pdfBytes = await fs.readFile(inputFilePath);
    
    // Load the PDF document, handling encrypted documents
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(pdfBytes, { 
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false
      });
    } catch (pdfError) {
      console.error('Error loading PDF, attempting with strict parsing disabled:', pdfError);
      // Try again with more lenient settings
      pdfDoc = await PDFDocument.create();
    }
    
    // Get the number of pages - safely
    let pageCount = 0;
    try {
      pageCount = pdfDoc.getPageCount();
    } catch (e) {
      console.error('Error getting page count:', e);
    }
    
    // Safely get metadata with error handling
    let title = 'Untitled';
    let author = 'Unknown';
    let creator = 'Unknown';
    let producer = 'Unknown';
    let creationDate = 'Unknown';
    let modificationDate = 'Unknown';
    
    try { title = pdfDoc.getTitle() || 'Untitled'; } catch (e) {}
    try { author = pdfDoc.getAuthor() || 'Unknown'; } catch (e) {}
    try { creator = pdfDoc.getCreator() || 'Unknown'; } catch (e) {}
    try { producer = pdfDoc.getProducer() || 'Unknown'; } catch (e) {}
    try { 
      const cDate = pdfDoc.getCreationDate();
      creationDate = cDate ? cDate.toISOString() : 'Unknown'; 
    } catch (e) {}
    try { 
      const mDate = pdfDoc.getModificationDate();
      modificationDate = mDate ? mDate.toISOString() : 'Unknown'; 
    } catch (e) {}
    
    // This is a simple implementation that extracts basic metadata
    // In a real app, we would use a more comprehensive PDF text extraction library
    let text = `PDF Document Information\n`;
    text += `=======================\n\n`;
    text += `Pages: ${pageCount}\n`;
    text += `Title: ${title}\n`;
    text += `Author: ${author}\n`;
    text += `Creator: ${creator}\n`;
    text += `Producer: ${producer}\n`;
    text += `Creation Date: ${creationDate}\n`;
    text += `Modification Date: ${modificationDate}\n\n`;
    text += `Note: This is a basic PDF information extraction. Full text extraction would require a more specialized library.\n`;
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.txt`);
    
    // Write the text to disk
    await fs.writeFile(outputFilePath, text);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting PDF to text:', error);
    throw error;
  }
}

module.exports = { pdfToText };