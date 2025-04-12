const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { convertPdfToText, convertFile } = require('../server/conversions');

// Test error handling with problematic files
async function testErrorHandling() {
  console.log('Testing error handling for problematic files...');
  
  try {
    // Create directories for test
    const testDir = path.join(__dirname, 'error_test');
    await fs.mkdir(testDir, { recursive: true });
    
    // Create a simulated "encrypted" PDF file (invalid PDF structure)
    const fakeEncryptedPdfPath = path.join(testDir, 'fake_encrypted.pdf');
    
    // The PDF header followed by an "Encrypt" dictionary to simulate encryption
    const fakeEncryptedPdfContent = `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [] /Count 0 >>
endobj
3 0 obj
<< /Type /Encrypt /Filter /Standard /V 2 /R 3 /Length 128 /P -1028 >>
endobj
trailer
<< /Root 1 0 R /Encrypt 3 0 R /Size 4 >>
%%EOF`;
    
    await fs.writeFile(fakeEncryptedPdfPath, fakeEncryptedPdfContent);
    console.log(`Created simulated encrypted PDF: ${fakeEncryptedPdfPath}`);
    
    // Test the PDF text extraction with the encrypted file
    console.log('\nTesting PDF extraction with encrypted file...');
    
    try {
      const result = await convertPdfToText(fakeEncryptedPdfPath, testDir);
      
      console.log('✅ Successfully handled encrypted PDF with fallback mechanism');
      
      // Check the content of the output file
      const outputContent = await fs.readFile(result, 'utf8');
      
      // Output should contain a message about encryption
      if (outputContent.includes('encrypted') || outputContent.includes('failed')) {
        console.log('✅ Output file contains appropriate message about encryption');
      } else {
        console.log('❌ Output file does not contain encryption warning');
      }
      
      console.log('\nPreview of output content:');
      console.log(outputContent.substring(0, 300) + '...');
      
    } catch (error) {
      console.log(`❌ Failed to handle encrypted PDF: ${error.message}`);
    }
    
    // Now create a malformed CSV file
    const malformedCsvPath = path.join(testDir, 'malformed.csv');
    const malformedCsvContent = `header1,header2,header3
value1,value2
value3,value4,value5,extra_value
"unclosed quote,value6,value7
value8,,value10`;
    
    await fs.writeFile(malformedCsvPath, malformedCsvContent);
    console.log(`\nCreated malformed CSV file: ${malformedCsvPath}`);
    
    // Test CSV to JSON conversion with malformed CSV
    console.log('\nTesting CSV to JSON conversion with malformed CSV...');
    
    try {
      const result = await convertFile(malformedCsvPath, testDir, 'json', 'test', {});
      
      console.log('✅ Successfully handled malformed CSV (conversion completed with warnings)');
      
      // Print the JSON result
      const jsonContent = await fs.readFile(result.filePath, 'utf8');
      console.log('\nPreview of output JSON:');
      console.log(jsonContent.substring(0, 300) + '...');
      
    } catch (error) {
      // Check if the error has info about CSV parsing
      if (error.message.includes('CSV') || error.message.includes('parse')) {
        console.log('✅ Conversion appropriately failed with CSV parsing error');
        console.log(`Error message: ${error.message}`);
      } else {
        console.log(`❌ Unexpected error handling malformed CSV: ${error.message}`);
      }
    }
    
    // Clean up test files
    await fs.unlink(fakeEncryptedPdfPath);
    await fs.unlink(malformedCsvPath);
    // Other files will be cleaned up if they were created
    
  } catch (error) {
    console.error('Error during error handling test:', error);
  }
}

// Run the error handling test
testErrorHandling();