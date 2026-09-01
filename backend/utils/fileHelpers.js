const fs = require('fs');
const path = require('path');

// Read and parse a JSON file; return [] if file doesn't exist
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Write data to a JSON file (pretty-printed)
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJSON, writeJSON };
