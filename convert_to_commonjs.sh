#!/bin/bash

# Convert all .js files from ES modules to CommonJS
find_and_replace() {
  find server -name "*.js" -type f | while read file; do
    echo "Converting $file to CommonJS"
    
    # Replace import statements
    sed -i.bak 's/import \([a-zA-Z0-9_]*\) from \(.*\);/const \1 = require(\2);/g' "$file"
    sed -i.bak 's/import { \([a-zA-Z0-9_, ]*\) } from \(.*\);/const { \1 } = require(\2);/g' "$file"
    sed -i.bak 's/import \* as \([a-zA-Z0-9_]*\) from \(.*\);/const \1 = require(\2);/g' "$file"
    
    # Replace export statements
    sed -i.bak 's/export default \(.*\);/module.exports = \1;/g' "$file"
    sed -i.bak 's/export { \([a-zA-Z0-9_, ]*\) };/module.exports = { \1 };/g' "$file"
    sed -i.bak 's/export const \([a-zA-Z0-9_]*\) = \(.*\);/const \1 = \2;\nmodule.exports.\1 = \1;/g' "$file"
    
    # Remove .js extensions from requires (CommonJS doesn't need them)
    sed -i.bak "s/require('\(.*\)\.js')/require('\1')/g" "$file"
    sed -i.bak 's/require("\(.*\)\.js")/require("\1")/g' "$file"
    
    # Remove ESM-specific code
    sed -i.bak '/import.meta.url/d' "$file"
    sed -i.bak '/fileURLToPath/d' "$file"
    
    # Clean up backup files
    rm -f "$file.bak"
  done
}

echo "Converting ES module imports/exports to CommonJS require/exports..."
find_and_replace

echo "Conversion complete!"