const http = require('http');
const fs = require('fs');
const path = require('path');

// Path to a test file
const testFile = path.join(__dirname, 'uploads', 'test.txt');

// Ensure test file exists
if (!fs.existsSync(testFile)) {
  fs.writeFileSync(testFile, 'This is a test document for API testing');
}

// Test invalid conversion via API
function testInvalidConversion() {
  console.log('Testing API response for invalid conversion...');
  
  // Options for the request
  const options = {
    hostname: 'localhost',
    port: 3333,  // Make sure this matches your server port
    path: '/api/convert',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // Invalid request (unsupported conversion)
  const data = JSON.stringify({
    filename: 'test.txt',
    targetFormat: 'invalidformat',
    useCase: 'test'
  });
  
  // Send the request
  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Response:', response);
        
        // Verify the response contains an error message
        if (res.statusCode === 400 && response.success === false) {
          console.log('✅ API correctly rejected invalid conversion format with proper error message');
        } else {
          console.log('❌ API response did not match expected error format');
        }
      } catch (e) {
        console.error('Error parsing JSON response:', e);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Error making request: ${e.message}`);
  });
  
  // Write the request body
  req.write(data);
  req.end();
}

// Function to test if the server is running
function checkServerRunning(callback) {
  const options = {
    hostname: 'localhost',
    port: 3333,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    callback(true);
  });
  
  req.on('error', () => {
    console.log('❌ Server does not appear to be running on port 3333');
    console.log('Please start the server with "npm run server" before running this test');
    callback(false);
  });
  
  req.end();
}

// Run the test
checkServerRunning((isRunning) => {
  if (isRunning) {
    testInvalidConversion();
  }
});