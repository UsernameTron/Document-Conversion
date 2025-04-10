const fs = require('fs/promises');
const path = require('path');

/**
 * Converts a JSON file to an HTML file with chart visualization
 * @param {string} inputFilePath - Path to the JSON file
 * @param {string} outputDir - Directory to save the HTML file
 * @param {Object} options - Additional conversion options
 * @param {string} options.chartType - Type of chart to generate (bar, line, pie, etc.)
 * @returns {Promise<string>} - Path to the converted HTML file with chart
 */
async function jsonToChart(inputFilePath, outputDir, options = {}) {
  try {
    // Set default chart type if not provided
    const chartType = options.chartType || 'bar';
    
    // Read the JSON file
    const jsonContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the JSON
    const jsonData = JSON.parse(jsonContent);
    
    // Prepare data for Chart.js
    let chartLabels = [];
    let chartData = [];
    let chartSeries = [];
    let dataStructure = '';
    
    // Detect the structure of the JSON data to determine how to visualize it
    if (Array.isArray(jsonData)) {
      // It's an array
      if (jsonData.length === 0) {
        throw new Error('JSON array is empty, cannot create chart');
      }
      
      if (typeof jsonData[0] === 'object' && jsonData[0] !== null) {
        // Array of objects - try to find label and value properties
        dataStructure = 'array-of-objects';
        
        // Get keys from the first object
        const keys = Object.keys(jsonData[0]);
        if (keys.length < 2) {
          throw new Error('JSON objects must have at least two properties for charting (labels and values)');
        }
        
        // Use the first key as labels and the second key as values
        const labelKey = keys[0];
        const valueKey = keys[1];
        
        // Extract data
        chartLabels = jsonData.map(item => item[labelKey]);
        chartData = jsonData.map(item => item[valueKey]);
        
        // If there are more keys, we can create multiple series for a grouped chart
        if (keys.length > 2 && ['bar', 'line'].includes(chartType)) {
          chartSeries = keys.slice(1).map(key => ({
            label: key,
            data: jsonData.map(item => item[key])
          }));
        }
      } else {
        // Array of primitives - use array indices as labels and values as-is
        dataStructure = 'array-of-primitives';
        chartLabels = jsonData.map((_, index) => `Item ${index + 1}`);
        chartData = jsonData;
      }
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      // It's an object - use keys as labels and values as data
      dataStructure = 'object';
      
      // Extract keys and values
      chartLabels = Object.keys(jsonData);
      chartData = Object.values(jsonData);
      
      // Check if we have nested data that could be used for multiple series
      const firstValue = chartData[0];
      if (typeof firstValue === 'object' && firstValue !== null && !Array.isArray(firstValue)) {
        // We might have a structure for multiple series
        const seriesKeys = Object.keys(firstValue);
        
        if (seriesKeys.length > 0) {
          // Create multiple series
          chartSeries = seriesKeys.map(key => ({
            label: key,
            data: chartLabels.map(label => jsonData[label][key])
          }));
          
          // Update data structure
          dataStructure = 'object-with-series';
        }
      }
    } else {
      throw new Error('JSON data must be an array or object to create a chart');
    }
    
    // Generate visual representation of the JSON structure for reference
    let jsonHtml = '';
    if (dataStructure === 'array-of-objects') {
      // Create a table from the array of objects
      jsonHtml = generateTableFromArray(jsonData);
    } else {
      // For other structures, just stringify with formatting
      jsonHtml = `<pre>${escapeHtml(JSON.stringify(jsonData, null, 2))}</pre>`;
    }
    
    // Create Chart.js dataset configuration
    let datasetConfig = '';
    
    if (chartSeries.length > 0) {
      // Multiple series dataset
      datasetConfig = `datasets: ${JSON.stringify(chartSeries.map((series, index) => {
        const bgColor = `rgba(${54 + index * 40}, ${162 - index * 30}, ${235 - index * 20}, 0.5)`;
        const borderColor = `rgba(${54 + index * 40}, ${162 - index * 30}, ${235 - index * 20}, 1)`;
        return {
          label: series.label,
          data: series.data,
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: 1
        };
      }))}`;
    } else {
      // Single series dataset
      datasetConfig = `datasets: [{
          label: 'Values',
          data: ${JSON.stringify(chartData)},
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]`;
    }
    
    // Create the full HTML document with Chart.js
    const title = path.basename(inputFilePath, '.json');
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - Chart Visualization</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 20px;
    }
    .chart-container {
      margin: 30px auto;
      max-width: 800px;
      height: 500px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: left;
    }
    th, td {
      padding: 10px;
      border: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    tr:hover {
      background-color: #f2f2f2;
    }
    .container {
      overflow-x: auto;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>${title} - Chart Visualization</h1>
  
  <div class="chart-container">
    <canvas id="myChart"></canvas>
  </div>
  
  <h2>Data</h2>
  <div class="container">
    ${jsonHtml}
  </div>
  
  <p>
    <small>Generated from ${path.basename(inputFilePath)} on ${new Date().toLocaleString()}</small>
  </p>
  
  <script>
  
    // Chart.js configuration
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Chart data
    const labels = ${JSON.stringify(chartLabels)};
    
    // Create chart
    const myChart = new Chart(ctx, {
      type: '${chartType}',
      data: {
        labels: labels,
        ${datasetConfig}
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  </script>
</body>
</html>`;
    
    // Generate output filename
    const outputFilePath = path.join(outputDir, `${title}_chart.html`);
    
    // Write the HTML content to the output file
    await fs.writeFile(outputFilePath, htmlContent);
    
    return outputFilePath;
  } catch (error) {
    console.error(`Error converting JSON to chart: ${error.message}`);
    throw error;
  }
}

/**
 * Generates an HTML table from an array of objects
 * @param {Array} arr - Array of objects
 * @returns {string} - HTML table
 */
function generateTableFromArray(arr) {
  if (arr.length === 0) {
    return '<p>Empty array</p>';
  }
  
  // Get all unique keys from all objects in the array
  const keys = Array.from(new Set(
    arr.flatMap(obj => Object.keys(obj))
  ));
  
  // Generate the table
  let html = '<table>\n';
  
  // Table header
  html += '  <thead>\n    <tr>\n';
  for (const key of keys) {
    html += `      <th>${escapeHtml(key)}</th>\n`;
  }
  html += '    </tr>\n  </thead>\n';
  
  // Table body
  html += '  <tbody>\n';
  for (const item of arr) {
    html += '    <tr>\n';
    for (const key of keys) {
      const value = item[key];
      if (value === undefined) {
        html += '      <td></td>\n';
      } else if (value === null) {
        html += '      <td><em>null</em></td>\n';
      } else if (typeof value === 'object') {
        html += `      <td>${escapeHtml(JSON.stringify(value))}</td>\n`;
      } else {
        html += `      <td>${escapeHtml(String(value))}</td>\n`;
      }
    }
    html += '    </tr>\n';
  }
  html += '  </tbody>\n</table>';
  
  return html;
}

/**
 * Escapes HTML special characters in a string
 * @param {string} str - The input string
 * @returns {string} - The escaped string
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { jsonToChart };