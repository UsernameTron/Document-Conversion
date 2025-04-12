const fs = require('fs/promises');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');

/**
 * Converts PDF file to text with improved error handling and fallback mechanisms
 * @param {string} inputFilePath - Path to the input PDF file
 * @param {string} outputDir - Directory to save the output file
 * @returns {Promise<string>} - Path to the converted file
 */
async function pdfToText(inputFilePath, outputDir) {
  try {
    // Read the PDF file
    const pdfBytes = await fs.readFile(inputFilePath);
    
    // First try with pdf-parse which has better text extraction
    let extractedText = '';
    let usedFallback = false;
    
    try {
      const data = await pdfParse(pdfBytes);
      extractedText = data.text;
      
      // If we got meaningful text, use it
      if (extractedText && extractedText.trim().length > 50) {
        console.log('Successfully extracted text from PDF using pdf-parse');
      } else {
        // No meaningful text extracted, will try fallback
        extractedText = '';
        throw new Error('Minimal text content extracted by pdf-parse');
      }
    } catch (parseError) {
      console.error('PDF parse error, trying fallback:', parseError.message);
      usedFallback = true;
      
      // Try with pdf-lib as fallback for encrypted or problematic PDFs
      try {
        // Load the PDF document with robust options
        const pdfDoc = await PDFDocument.load(pdfBytes, { 
          ignoreEncryption: true,
          throwOnInvalidObject: false,
          updateMetadata: false
        });
        
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
        
        // Format metadata information when text extraction fails
        extractedText = `PDF Document Information\n`;
        extractedText += `=======================\n\n`;
        extractedText += `Pages: ${pageCount}\n`;
        extractedText += `Title: ${title}\n`;
        extractedText += `Author: ${author}\n`;
        extractedText += `Creator: ${creator}\n`;
        extractedText += `Producer: ${producer}\n`;
        extractedText += `Creation Date: ${creationDate}\n`;
        extractedText += `Modification Date: ${modificationDate}\n\n`;
        extractedText += `Note: This PDF may be encrypted or contain non-extractable text. Consider using OCR for better text extraction.\n`;
      } catch (pdfLibError) {
        console.error('Both PDF parsers failed:', pdfLibError.message);
        
        // Create a minimal response when both methods fail
        extractedText = `Unable to extract text from this PDF document.\n\n`;
        extractedText += `The file may be corrupted, password-protected, or contain non-extractable text.\n`;
        extractedText += `Consider using OCR to extract text from this document.\n\n`;
        extractedText += `Original error: ${parseError.message}\n`;
        extractedText += `Secondary error: ${pdfLibError.message}\n`;
      }
    }
    
    // Generate output filename
    const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
    const outputFilePath = path.join(outputDir, `${inputFileName}.txt`);
    
    // Add a header to indicate which method was used
    const headerText = usedFallback 
      ? "Note: Text extraction was limited due to PDF restrictions. OCR may provide better results.\n\n"
      : "PDF Text Extraction Results\n=======================\n\n";
    
    // Write the text to disk
    await fs.writeFile(outputFilePath, headerText + extractedText);
    
    return outputFilePath;
  } catch (error) {
    console.error('Error converting PDF to text:', error);
    throw error;
  }
}

module.exports = { pdfToText };