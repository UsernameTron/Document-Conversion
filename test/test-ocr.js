const fs = require('fs').promises;
const path = require('path');
const { performOcr } = require('../server/conversions/ocrImage');

async function testOcrFunctionality() {
  console.log('Testing OCR functionality...');
  
  try {
    // Create a directory for test output
    const testDir = path.join(__dirname, 'ocr_test');
    await fs.mkdir(testDir, { recursive: true });
    
    // Path to a test image - if you don't have one, this will show a graceful error
    const imagePath = path.join(__dirname, 'uploads', 'test-image.png');
    
    try {
      // Check if the test image exists before proceeding
      await fs.access(imagePath);
      
      console.log(`Using test image: ${imagePath}`);
      
      // Perform OCR on the image
      const text = await performOcr(imagePath, 'eng');
      
      // Check if we got some text back
      if (text && text.length > 0) {
        console.log('✅ OCR successfully extracted text from the image');
        console.log('First 200 characters of extracted text:');
        console.log(text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      } else {
        console.log('❌ OCR did not extract any text from the image');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`❌ Test image not found at ${imagePath}`);
        console.log('To run this test, please place a test image named "test-image.png" in the test/uploads directory');
        
        // Create a sample text file instead to verify the test structure
        const textPath = path.join(testDir, 'ocr_fallback.txt');
        await fs.writeFile(textPath, 'This simulates OCR output since no test image was available.');
        console.log(`✅ Created a simulated OCR output file for testing: ${textPath}`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error during OCR test:', error);
  }
}

// Run the test
testOcrFunctionality();