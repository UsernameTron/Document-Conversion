const fs = require('fs/promises');
const path = require('path');
const { convertFile } = require('../server/conversions');

async function testDocxToHtml() {
  console.log('Testing DOCX to HTML conversion with updated modules...');
  
  try {
    // Check if we have a test DOCX file
    const testDir = path.join(__dirname, 'uploads');
    const outDir = path.join(__dirname, 'converted');
    
    // Create output directory if it doesn't exist
    await fs.mkdir(outDir, { recursive: true });
    
    // First check if we have a .docx file to test with
    const docxFiles = await fs.readdir(path.join(testDir, 'docx'));
    const docxFile = docxFiles.find(file => file.endsWith('.docx'));
    
    if (!docxFile) {
      console.log('\nℹ️ No DOCX test file found. Please add a .docx file to test/uploads/docx directory.');
      console.log('Manual testing with a DOCX file is required to verify the fix.');
      return;
    }
    
    const inputPath = path.join(testDir, 'docx', docxFile);
    
    // Test docx to html
    console.log(`Testing DOCX to HTML conversion for: ${docxFile}`);
    
    try {
      const result = await convertFile(inputPath, outDir, 'html', 'test');
      
      if (result.success) {
        console.log(`\n✅ DOCX to HTML conversion successful`);
        console.log(`   Output file: ${result.fileName}`);
        
        // Print first few lines of the output file
        const htmlContent = await fs.readFile(result.filePath, 'utf8');
        const previewLines = htmlContent.split('\n').slice(0, 10).join('\n');
        console.log('\nPreview of converted HTML:');
        console.log(previewLines + '...');
      } else {
        console.log(`\n❌ DOCX to HTML conversion failed`);
      }
    } catch (error) {
      console.log(`\n❌ DOCX to HTML conversion error: ${error.message}`);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testDocxToHtml();