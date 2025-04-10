/**
 * Test Conversion Functionality
 * 
 * This script tests the various conversion options to ensure they're working correctly
 */

const fs = require('fs').promises;
const path = require('path');
const { convertFile } = require('../server/conversions/index');

// Configuration
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const CONVERTED_DIR = path.join(__dirname, 'converted');
const USE_CASE = 'test';

// Create test directories if they don't exist
async function ensureDirectories() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.mkdir(CONVERTED_DIR, { recursive: true });
    console.log('✓ Test directories created');
  } catch (error) {
    console.error('Error creating directories:', error);
    process.exit(1);
  }
}

// Create test files
async function createTestFiles() {
  try {
    // Text file
    await fs.writeFile(path.join(UPLOADS_DIR, 'test.txt'), 'This is a test text file.');
    
    // JSON file (array)
    await fs.writeFile(
      path.join(UPLOADS_DIR, 'test_array.json'), 
      JSON.stringify([{ id: 1, name: 'test1' }, { id: 2, name: 'test2' }], null, 2)
    );
    
    // JSON file (object)
    await fs.writeFile(
      path.join(UPLOADS_DIR, 'test_object.json'),
      JSON.stringify({ test: 'value', array: [1, 2, 3] }, null, 2)
    );
    
    // CSV file
    await fs.writeFile(
      path.join(UPLOADS_DIR, 'test.csv'),
      'id,name,value\n1,test1,100\n2,test2,200'
    );
    
    // Markdown file
    await fs.writeFile(
      path.join(UPLOADS_DIR, 'test.md'),
      '# Markdown Test\n\nThis is a test markdown file.\n\n- Item 1\n- Item 2\n'
    );
    
    // HTML file
    await fs.writeFile(
      path.join(UPLOADS_DIR, 'test.html'),
      '<h1>Test HTML</h1><p>This is a test HTML document</p>'
    );
    
    console.log('✓ Test files created');
  } catch (error) {
    console.error('Error creating test files:', error);
    process.exit(1);
  }
}

// Test conversion
async function testConversion(inputFile, targetFormat, label) {
  try {
    console.log(`Testing ${label}...`);
    const result = await convertFile(
      path.join(UPLOADS_DIR, inputFile),
      CONVERTED_DIR,
      targetFormat,
      USE_CASE
    );
    console.log(`✅ ${label} successful`);
    console.log(`   Output file: ${result.fileName}`);
    return true;
  } catch (error) {
    console.log(`❌ ${label} failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  try {
    await ensureDirectories();
    await createTestFiles();
    
    // Array to store all test promises
    const testPromises = [
      testConversion('test.txt', 'pdf', 'TXT to PDF conversion'),
      testConversion('test.html', 'md', 'HTML to MD conversion'),
      testConversion('test_array.json', 'csv', 'JSON (array) to CSV conversion'),
      testConversion('test_object.json', 'csv', 'JSON (object) to CSV conversion'),
      testConversion('test.csv', 'json', 'CSV to JSON conversion'),
      testConversion('test.md', 'html', 'MD to HTML conversion')
    ];
    
    // Wait for all tests to complete
    const results = await Promise.all(testPromises);
    
    // Print summary
    const total = results.length;
    const successful = results.filter(r => r).length;
    
    console.log('\n==========================');
    console.log(`Summary: ${successful}/${total} conversions successful`);
    console.log('==========================\n');
    
    // Exit with appropriate code
    process.exit(successful === total ? 0 : 1);
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();