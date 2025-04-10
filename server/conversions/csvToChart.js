const fs = require('fs/promises');
const path = require('path');
const papaparse = require('papaparse');

/**
 * Converts a CSV file to an HTML file with chart visualization
 * @param {string} inputFilePath - Path to the CSV file
 * @param {string} outputDir - Directory to save the HTML file
 * @param {Object} options - Additional conversion options
 * @param {string} options.chartType - Type of chart to generate (bar, line, pie, etc.)
 * @returns {Promise<string>} - Path to the converted HTML file with chart
 */
async function csvToChart(inputFilePath, outputDir, options = {}) {
  try {
    // Set default chart type if not provided
    const chartType = options.chartType || 'bar';
    
    // Read the CSV file
    const csvContent = await fs.readFile(inputFilePath, 'utf-8');
    
    // Parse the CSV
    const parseResult = papaparse.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true // Automatically convert numeric values
    });
    
    // Get the column headers and data
    const headers = parseResult.meta.fields || [];
    const data = parseResult.data || [];
    
    if (headers.length < 2) {
      throw new Error('CSV must have at least two columns for charting (labels and values)');
    }
    
    // Determine which columns to use for the chart
    // For simplicity, we'll use the first column for labels and the second for values
    const labelColumn = headers[0];
    const valueColumn = headers[1];
    
    // Prepare data for chart.js
    const chartLabels = [];
    const chartValues = [];
    
    // Extract data for charting
    for (const row of data) {
      if (row[labelColumn] !== undefined && row[valueColumn] !== undefined) {
        chartLabels.push(row[labelColumn]);
        chartValues.push(row[valueColumn]);
      }
    }
    
    // Generate a table from CSV for reference
    let tableHtml = '<table border="1" cellpadding="5" cellspacing="0">\n';
    
    // Add table header
    tableHtml += '  <thead>\n    <tr>\n';
    for (const header of headers) {
      tableHtml += `      <th>${escapeHtml(header)}</th>\n`;
    }
    tableHtml += '    </tr>\n  </thead>\n';
    
    // Add table body
    tableHtml += '  <tbody>\n';
    for (const row of data) {
      tableHtml += '    <tr>\n';
      for (const header of headers) {
        const cellValue = row[header] !== undefined && row[header] !== null ? 
          row[header] : '';
        tableHtml += `      <td>${escapeHtml(String(cellValue))}</td>\n`;
      }
      tableHtml += '    </tr>\n';
    }
    tableHtml += '  </tbody>\n</table>';
    
    // Create the full HTML document with Chart.js
    const title = path.basename(inputFilePath, '.csv');
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
  </style>
</head>
<body>
  <h1>${title} - Chart Visualization</h1>
  
  <div class="chart-container">
    <canvas id="myChart"></canvas>
  </div>
  
  <h2>Data Table</h2>
  <div class="container">
    ${tableHtml}
  </div>
  
  <p>
    <small>Generated from ${path.basename(inputFilePath)} on ${new Date().toLocaleString()}</small>
  </p>
  
  <script>
    // Chart.js configuration
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Chart data
    const labels = ${JSON.stringify(chartLabels)};
    const values = ${JSON.stringify(chartValues)};
    
    // Create chart
    const myChart = new Chart(ctx, {
      type: '${chartType}',
      data: {
        labels: labels,
        datasets: [{
          label: '${escapeJs(valueColumn)}',
          data: values,
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
        }]
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
    console.error(`Error converting CSV to chart: ${error.message}`);
    throw error;
  }
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

/**
 * Escapes JavaScript special characters in a string
 * @param {string} str - The input string
 * @returns {string} - The escaped string
 */
function escapeJs(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '\\\'')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

module.exports = { csvToChart };