#!/bin/bash

# Convert remaining export functions in conversion modules

for file in server/conversions/htmlToMarkdown.js server/conversions/ocrImage.js server/conversions/jsonToCsv.js server/conversions/markdownToHtml.js server/conversions/excelToCsv.js server/conversions/csvToJson.js; do
  echo "Processing $file..."
  
  # Get the function name
  function_name=$(grep -o "export \(async \)\?function \([a-zA-Z0-9]*\)" "$file" | sed -E 's/export (async )?function ([a-zA-Z0-9]*).*/\2/')
  
  # Replace export function with function
  sed -i.bak 's/export \(async \)\?function/async function/g' "$file"
  
  # Check if module.exports already exists
  if ! grep -q "module.exports" "$file"; then
    # Add module.exports at the end of the file
    echo "" >> "$file"
    echo "module.exports = { $function_name };" >> "$file"
  fi
  
  # Remove backup files
  rm -f "$file.bak"
done

echo "Conversion complete!"