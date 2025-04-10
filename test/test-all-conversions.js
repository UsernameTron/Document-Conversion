/**
 * Comprehensive Test for All Conversion Combinations
 * 
 * This script tests all possible conversion combinations defined in the conversion matrix
 */

const fs = require('fs').promises;
const path = require('path');
const { convertFile, CONVERSION_MATRIX, isConversionSupported } = require('../server/conversions/index');

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

// Create test files for all supported source formats
async function createTestFiles() {
  try {
    // Get all source formats from the conversion matrix
    const sourceFormats = Object.keys(CONVERSION_MATRIX);
    
    // Text file (.txt)
    if (sourceFormats.includes('txt') || sourceFormats.includes('text')) {
      await fs.writeFile(
        path.join(UPLOADS_DIR, 'test.txt'), 
        'This is a test text file.\nIt has multiple lines.\nThis is line 3.'
      );
      console.log('✓ Created test.txt');
    }
    
    // JSON file - array (.json)
    if (sourceFormats.includes('json')) {
      await fs.writeFile(
        path.join(UPLOADS_DIR, 'test_array.json'), 
        JSON.stringify([
          { id: 1, name: 'test1', value: 100 }, 
          { id: 2, name: 'test2', value: 200 }
        ], null, 2)
      );
      console.log('✓ Created test_array.json');
      
      // JSON file - object (.json)
      await fs.writeFile(
        path.join(UPLOADS_DIR, 'test_object.json'),
        JSON.stringify({ 
          title: 'Test Object', 
          description: 'This is a test JSON object',
          values: [1, 2, 3],
          nested: { a: 1, b: 2 }
        }, null, 2)
      );
      console.log('✓ Created test_object.json');
      
      // JSON file for chart (.json)
      await fs.writeFile(
        path.join(UPLOADS_DIR, 'test_chart.json'),
        JSON.stringify([
          { key: 'A', value: 10 },
          { key: 'B', value: 20 },
          { key: 'C', value: 30 },
          { key: 'D', value: 15 }
        ], null, 2)
      );
      console.log('✓ Created test_chart.json');
    }
    
    // CSV file (.csv)
    if (sourceFormats.includes('csv')) {
      await fs.writeFile(
        path.join(UPLOADS_DIR, 'test.csv'),
        'id,name,value,description\n1,test1,100,"First test item"\n2,test2,200,"Second test item"'
      );
      console.log('✓ Created test.csv');
      
      // CSV file for chart
      await fs.writeFile(
        path.join(UPLOADS_DIR, 'test_chart.csv'),
        'key,value\nA,10\nB,20\nC,30\nD,15'
      );
      console.log('✓ Created test_chart.csv');
    }
    
    // Markdown file (.md)
    if (sourceFormats.includes('md') || sourceFormats.includes('markdown')) {
      await fs.writeFile(
        path.join(UPLOADS_DIR, 'test.md'),
        '# Markdown Test Document\n\n' +
        'This is a **test** markdown file with some formatting.\n\n' +
        '## Section 1\n\n' +
        '- Item 1\n' +
        '- Item 2\n' +
        '- Item 3\n\n' +
        '## Section 2\n\n' +
        '1. First numbered item\n' +
        '2. Second numbered item\n\n' +
        '```\nSome code block\n```\n\n' +
        '> A blockquote\n\n' +
        '[A link](https://example.com)'
      );
      console.log('✓ Created test.md');
    }
    
    // HTML file (.html)
    if (sourceFormats.includes('html')) {
      await fs.writeFile(
        path.join(UPLOADS_DIR, 'test.html'),
        '<!DOCTYPE html>\n<html>\n<head>\n  <title>Test HTML Document</title>\n</head>\n<body>\n' +
        '  <h1>Test HTML Document</h1>\n' +
        '  <p>This is a <strong>test</strong> HTML document with some formatting.</p>\n' +
        '  <h2>Section 1</h2>\n' +
        '  <ul>\n' +
        '    <li>Item 1</li>\n' +
        '    <li>Item 2</li>\n' +
        '    <li>Item 3</li>\n' +
        '  </ul>\n' +
        '  <h2>Section 2</h2>\n' +
        '  <ol>\n' +
        '    <li>First numbered item</li>\n' +
        '    <li>Second numbered item</li>\n' +
        '  </ol>\n' +
        '  <pre><code>Some code block</code></pre>\n' +
        '  <blockquote>A blockquote</blockquote>\n' +
        '  <p><a href="https://example.com">A link</a></p>\n' +
        '</body>\n</html>'
      );
      console.log('✓ Created test.html');
    }
    
    // Create PDF file from HTML conversion
    if (sourceFormats.includes('pdf')) {
      // First create HTML, then convert to PDF
      const htmlPath = path.join(UPLOADS_DIR, 'test_for_pdf.html');
      await fs.writeFile(
        htmlPath,
        '<!DOCTYPE html>\n<html>\n<head>\n  <title>PDF Test Document</title>\n</head>\n<body>\n' +
        '  <h1>PDF Test Document</h1>\n' +
        '  <p>This is a <strong>test</strong> document for PDF conversion.</p>\n' +
        '  <ul>\n    <li>PDF Test Item 1</li>\n    <li>PDF Test Item 2</li>\n  </ul>\n' +
        '</body>\n</html>'
      );
      
      try {
        // Convert HTML to PDF using our own conversion system
        await convertFile(
          htmlPath,
          UPLOADS_DIR,
          'pdf',
          'test'
        );
        console.log('✓ Created test.pdf');
        
        // Rename the file to the standard test.pdf name
        const generatedPdf = path.join(CONVERTED_DIR, 'test_for_pdf.pdf');
        const targetPdf = path.join(UPLOADS_DIR, 'test.pdf');
        
        // Check if generated file exists before trying to copy it
        try {
          await fs.access(generatedPdf);
          await fs.copyFile(generatedPdf, targetPdf);
        } catch (e) {
          console.log('⚠️ Could not copy PDF, but continuing test');
        }
      } catch (e) {
        console.log('⚠️ Could not generate test.pdf, but continuing test');
      }
    }
    
    // Create DOCX file (if we can)
    if (sourceFormats.includes('docx')) {
      try {
        // Try to create a simple DOCX file
        const docx = require('docx');
        const { Document, Packer, Paragraph, TextRun } = docx;
        
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [new TextRun("This is a test DOCX document.")],
              }),
              new Paragraph({
                children: [new TextRun("It contains multiple paragraphs.")],
              }),
              new Paragraph({
                children: [new TextRun("This is a third paragraph.")],
              }),
            ],
          }],
        });
        
        // Generate buffer
        const buffer = await Packer.toBuffer(doc);
        
        // Write to file
        await fs.writeFile(path.join(UPLOADS_DIR, 'test.docx'), buffer);
        console.log('✓ Created test.docx');
      } catch (e) {
        // If docx module is not available, we'll skip this
        console.log('⚠️ Could not create DOCX file (docx module may not be installed), but continuing test');
      }
    }
    
    // Create Excel files (XLSX/XLS) if possible
    if (sourceFormats.includes('xlsx') || sourceFormats.includes('xls')) {
      try {
        // Try to use xlsx library if available
        const xlsx = require('xlsx');
        
        // Create a workbook with test data
        const workbook = xlsx.utils.book_new();
        const testData = [
          ['id', 'name', 'value'],
          [1, 'test1', 100],
          [2, 'test2', 200]
        ];
        
        const worksheet = xlsx.utils.aoa_to_sheet(testData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Test Data');
        
        if (sourceFormats.includes('xlsx')) {
          xlsx.writeFile(workbook, path.join(UPLOADS_DIR, 'test.xlsx'));
          console.log('✓ Created test.xlsx');
        }
        
        if (sourceFormats.includes('xls')) {
          xlsx.writeFile(workbook, path.join(UPLOADS_DIR, 'test.xls'));
          console.log('✓ Created test.xls');
        }
      } catch (e) {
        // If xlsx module is not available, we'll skip this
        console.log('⚠️ Could not create Excel files (xlsx module may not be installed), but continuing test');
      }
    }
    
    console.log('✓ All test files created');
  } catch (error) {
    console.error('Error creating test files:', error);
    process.exit(1);
  }
}

// Get all possible conversion combinations from the matrix
function getAllConversionCombinations() {
  const combinations = [];
  
  // For each source format in the matrix
  for (const [sourceFormat, targetFormats] of Object.entries(CONVERSION_MATRIX)) {
    // For each target format available for this source
    for (const targetFormat of targetFormats) {
      // Add the combination to our list
      combinations.push({
        sourceFormat,
        targetFormat,
        sourceFile: sourceFormat === 'json' ? 'test_array.json' : `test.${sourceFormat}`
      });
    }
  }
  
  return combinations;
}

// Test a specific conversion
async function testConversion(sourceFile, sourceFormat, targetFormat) {
  try {
    console.log(`Testing ${sourceFormat} to ${targetFormat} conversion...`);
    
    // Skip if file doesn't exist (some formats might not have test files)
    try {
      await fs.access(path.join(UPLOADS_DIR, sourceFile));
    } catch (e) {
      console.log(`❓ ${sourceFormat} to ${targetFormat} skipped (no source file)`);
      return { status: 'skipped', reason: 'No source file' };
    }
    
    // Try to convert
    const result = await convertFile(
      path.join(UPLOADS_DIR, sourceFile),
      CONVERTED_DIR,
      targetFormat,
      USE_CASE
    );
    
    console.log(`✅ ${sourceFormat} to ${targetFormat} successful`);
    console.log(`   Output file: ${result.fileName}`);
    return { status: 'success', result };
  } catch (error) {
    console.log(`❌ ${sourceFormat} to ${targetFormat} failed: ${error.message}`);
    return { status: 'failed', error: error.message };
  }
}

// Group test results by status
function groupResults(results) {
  return results.reduce((acc, curr) => {
    if (!acc[curr.status]) {
      acc[curr.status] = [];
    }
    acc[curr.status].push(curr);
    return acc;
  }, {});
}

// Run all tests
async function runTests() {
  try {
    await ensureDirectories();
    await createTestFiles();
    
    // Get all conversion combinations
    const combinations = getAllConversionCombinations();
    console.log(`Found ${combinations.length} possible conversion combinations to test`);
    
    // Run all conversions
    const results = [];
    for (const combo of combinations) {
      const result = await testConversion(combo.sourceFile, combo.sourceFormat, combo.targetFormat);
      results.push({
        ...result,
        sourceFormat: combo.sourceFormat,
        targetFormat: combo.targetFormat
      });
    }
    
    // Group results by status
    const groupedResults = groupResults(results);
    
    // Print summary
    console.log('\n==========================');
    console.log('CONVERSION TEST SUMMARY');
    console.log('==========================');
    
    if (groupedResults.success && groupedResults.success.length > 0) {
      console.log(`\n✅ Successful conversions: ${groupedResults.success.length}`);
      for (const result of groupedResults.success) {
        console.log(`   - ${result.sourceFormat} → ${result.targetFormat}`);
      }
    }
    
    if (groupedResults.failed && groupedResults.failed.length > 0) {
      console.log(`\n❌ Failed conversions: ${groupedResults.failed.length}`);
      for (const result of groupedResults.failed) {
        console.log(`   - ${result.sourceFormat} → ${result.targetFormat}: ${result.error}`);
      }
    }
    
    if (groupedResults.skipped && groupedResults.skipped.length > 0) {
      console.log(`\n❓ Skipped conversions: ${groupedResults.skipped.length}`);
      for (const result of groupedResults.skipped) {
        console.log(`   - ${result.sourceFormat} → ${result.targetFormat}: ${result.reason}`);
      }
    }
    
    const total = results.length;
    const successful = (groupedResults.success || []).length;
    const successRate = Math.round((successful / total) * 100);
    
    console.log('\n==========================');
    console.log(`Overall: ${successful}/${total} conversions successful (${successRate}%)`);
    console.log('==========================');
    
    // Exit with appropriate code
    const failed = (groupedResults.failed || []).length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();