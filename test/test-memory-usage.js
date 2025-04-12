const fs = require('fs').promises;
const path = require('path');
const { convertFile } = require('../server/conversions');

// Memory usage monitoring test
async function testMemoryUsage() {
  console.log('Testing memory usage during conversion operations...');
  
  try {
    // Create directories for test
    const testDir = path.join(__dirname, 'memory_test');
    await fs.mkdir(testDir, { recursive: true });
    
    // Create a moderately large test file (5MB text file)
    const inputFile = path.join(testDir, 'large_test.txt');
    
    console.log('Creating test file...');
    
    // Generate lorem ipsum style text (5MB worth)
    const paragraphTemplate = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ';
    
    const targetSizeBytes = 5 * 1024 * 1024; // 5MB
    const paragraphBytes = Buffer.from(paragraphTemplate).length;
    const paragraphsNeeded = Math.ceil(targetSizeBytes / paragraphBytes);
    
    let content = '';
    for (let i = 0; i < paragraphsNeeded; i++) {
      content += paragraphTemplate + '\n\n';
    }
    
    await fs.writeFile(inputFile, content);
    
    // Log memory usage before conversion
    const memBefore = process.memoryUsage();
    console.log('Memory usage before conversion:');
    console.log(`- RSS: ${(memBefore.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Heap Total: ${(memBefore.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Heap Used: ${(memBefore.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\nPerforming conversion: TXT to PDF...');
    
    // Convert the large text file to PDF
    const startTime = Date.now();
    const result = await convertFile(inputFile, testDir, 'pdf', 'memory-test');
    const endTime = Date.now();
    
    // Log memory usage after conversion
    const memAfter = process.memoryUsage();
    console.log('\nMemory usage after conversion:');
    console.log(`- RSS: ${(memAfter.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Heap Total: ${(memAfter.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Heap Used: ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    // Calculate memory increase
    const rssDiff = memAfter.rss - memBefore.rss;
    const heapTotalDiff = memAfter.heapTotal - memBefore.heapTotal;
    const heapUsedDiff = memAfter.heapUsed - memBefore.heapUsed;
    
    console.log('\nMemory increase:');
    console.log(`- RSS: ${(rssDiff / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Heap Total: ${(heapTotalDiff / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Heap Used: ${(heapUsedDiff / 1024 / 1024).toFixed(2)} MB`);
    
    // Log conversion time
    console.log(`\nConversion time: ${(endTime - startTime) / 1000} seconds`);
    
    // Check for potential memory leaks
    if (heapUsedDiff > 50 * 1024 * 1024) { // 50MB threshold
      console.log('\n⚠️ Warning: Large increase in heap memory usage detected. Potential memory leak.');
    } else {
      console.log('\n✅ Memory usage appears normal for this operation.');
    }
    
    console.log(`\nOutput file: ${result.fileName}`);
    
    // Get file stats
    const stats = await fs.stat(result.filePath);
    console.log(`Output size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Clean up
    console.log('\nCleaning up test files...');
    await fs.unlink(inputFile);
    await fs.unlink(result.filePath);
    
  } catch (error) {
    console.error('Error during memory usage test:', error);
  }
}

// Run the memory usage test
testMemoryUsage();