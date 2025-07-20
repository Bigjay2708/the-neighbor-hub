#!/bin/bash

# Script to replace console statements with winston logger in route files

BACKEND_DIR="c:/Users/bigja/Desktop/neighbor-hub/backend"

# List of route files to update
FILES=(
  "routes/forum.js"
  "routes/marketplace.js" 
  "routes/messages.js"
  "routes/safety.js"
  "routes/upload.js"
  "routes/users.js"
)

echo "Updating console statements to winston logger..."

for file in "${FILES[@]}"; do
  full_path="$BACKEND_DIR/$file"
  echo "Processing $full_path"
  
  # Add logger import if not present
  if ! grep -q "const logger = require" "$full_path"; then
    # Find the line with the last require statement and add logger after it
    sed -i '/const.*= require/a const logger = require('\''../utils/logger'\'');' "$full_path"
  fi
  
  # Replace console.error statements with logger.error
  sed -i "s/console\.error('\([^']*\)',\s*error);/logger.error('\1', { error: error.message, stack: error.stack });/g" "$full_path"
  sed -i 's/console\.error("\([^"]*\)",\s*error);/logger.error("\1", { error: error.message, stack: error.stack });/g' "$full_path"
  
  # Replace console.log statements with logger.info
  sed -i "s/console\.log('\([^']*\)'/logger.info('\1'/g" "$full_path"
  sed -i 's/console\.log("\([^"]*\)"/logger.info("\1"/g' "$full_path"
  
  # Replace console.warn statements with logger.warn
  sed -i "s/console\.warn('\([^']*\)'/logger.warn('\1'/g" "$full_path"
  sed -i 's/console\.warn("\([^"]*\)"/logger.warn("\1"/g' "$full_path"
  
done

echo "Console statement updates completed!"
