const fs = require('fs');
const path = require('path');


const plexPath = path.resolve(__dirname, '../src/data/plex.json');
if (fs.existsSync(plexPath)) {
  const raw = fs.readFileSync(plexPath, 'utf8');
  const data = JSON.parse(raw);

  data.allRatings?.forEach((item, i) => {
    if (!item.title) {
      console.error(`Validation Error: Item at index ${i} is missing a title.`);
      process.exit(1);
    }
  });

  console.log('✅ Plex data validation passed (or skipped safely).');
} else {
  console.log('⚠️ Plex data file missing, skipping validation.');
}
