const fs = require('fs/promises');
const path = require('path');
const { convertFile } = require('../server/conversions');

async function testPdfHandling() {
  console.log('Testing PDF handling with fallback mechanisms...');
  
  try {
    // Check if we have a test PDF file
    const testDir = path.join(__dirname, 'uploads');
    const outDir = path.join(__dirname, 'converted');
    
    // Create directories
    await fs.mkdir(path.join(testDir, 'pdf'), { recursive: true });
    await fs.mkdir(outDir, { recursive: true });
    
    // Create a simple text file to convert to PDF for testing
    const textFilePath = path.join(testDir, 'pdf', 'test.txt');
    await fs.writeFile(textFilePath, 'This is a test document for PDF conversion testing.');
    
    // First convert text to PDF to have a PDF to test with
    console.log('Creating test PDF from text...');
    let pdfResult;
    
    try {
      pdfResult = await convertFile(textFilePath, outDir, 'pdf', 'test');
      
      if (pdfResult.success) {
        console.log(`\n✅ Text to PDF conversion successful`);
        console.log(`   Output file: ${pdfResult.fileName}`);
        
        // Now test PDF to text with the new robust implementation
        console.log('\nTesting PDF to text conversion with fallback mechanisms...');
        
        try {
          const result = await convertFile(pdfResult.filePath, outDir, 'text', 'test', {
            useOcr: true
          });
          
          if (result.success) {
            console.log(`\n✅ PDF to text conversion successful`);
            console.log(`   Output file: ${result.fileName}`);
            console.log(`   OCR used: ${result.usedOcr ? 'Yes' : 'No'}`);
            
            // Print the content of the output file
            const textContent = await fs.readFile(result.filePath, 'utf8');
            console.log('\nExtracted text content:');
            console.log(textContent.substring(0, 500) + (textContent.length > 500 ? '...' : ''));
          } else {
            console.log(`\n❌ PDF to text conversion failed`);
          }
        } catch (error) {
          console.log(`\n❌ PDF to text conversion error: ${error.message}`);
        }
      } else {
        console.log(`\n❌ Could not create test PDF`);
      }
    } catch (error) {
      console.log(`\n❌ Text to PDF conversion error: ${error.message}`);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testPdfHandling();