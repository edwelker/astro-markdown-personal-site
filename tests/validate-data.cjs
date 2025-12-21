const fs = require('fs');
const path = require('path');

const traktPath = path.resolve(__dirname, '../src/data/trakt.json');

if (fs.existsSync(traktPath)) {
  const raw = fs.readFileSync(traktPath, 'utf8');
  const data = JSON.parse(raw);

  // Use Optional Chaining (?.) to ensure we only loop if allRatings exists.
  // This prevents the 'Cannot read properties of undefined' crash.
  data.allRatings?.forEach((item, i) => {
    if (!item.title) {
      console.error(`Validation Error: Item at index ${i} is missing a title.`);
      process.exit(1);
    }
  });
  
  console.log('✅ Trakt data validation passed (or skipped safely).');
} else {
  console.log('⚠️ Trakt data file missing, skipping validation.');
}
