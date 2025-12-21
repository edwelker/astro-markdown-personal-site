const fs = require('fs');
const path = require('path');

function safeWrite(filename, defaultContent, fetchFunction) {
  const targetPath = path.join('src/data', filename);
  try {
    fetchFunction();
  } catch (e) {
    console.error(`Error fetching ${filename}, reverting to default.`);
    fs.writeFileSync(targetPath, JSON.stringify(defaultContent));
  }
}
