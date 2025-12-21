const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data/trakt.json');
if (!fs.existsSync(dataPath)) {
  console.error("❌ Data missing: src/data/trakt.json");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const errors = [];

// 1. Root Level Validation
if (!data.username) errors.push("Root: Missing username field");
if (!Array.isArray(data.allRatings)) errors.push("Root: allRatings must be an array");

// 2. Deep Rating Validation
data.allRatings.forEach((item, i) => {
  const context = `Item ${i} (${item.title || 'Unknown'})`;
  
  if (!item.title) errors.push(`${context}: Missing title`);
  if (!item.year || item.year < 1888) errors.push(`${context}: Invalid year (${item.year})`);
  
  if (typeof item.rating !== 'number' || item.rating < 1 || item.rating > 10) {
    errors.push(`${context}: Rating ${item.rating} is out of bounds (1-10)`);
  }

  if (!item.poster) {
    errors.push(`${context}: Missing poster path`);
  } else {
    const posterPath = path.join(__dirname, '../public', item.poster);
    if (!fs.existsSync(posterPath)) {
      errors.push(`${context}: Poster file not found at ${item.poster}`);
    }
  }
});

// 3. Stats Validation
if (!Array.isArray(data.sparkline) || data.sparkline.length === 0) {
  errors.push("Stats: Sparkline data is empty");
}

if (errors.length > 0) {
  console.error(`❌ Validation failed with ${errors.length} errors:`);
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

console.log("✅ Data validation successful: Schema, Ranges, and Assets verified.");
