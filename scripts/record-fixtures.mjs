import fs from 'fs';
import path from 'path';

const FIXTURE_DIR = './tests/fixtures';
const DATA_DIR = './src/data';

if (!fs.existsSync(FIXTURE_DIR)) {
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });
}

const sources = [
  { file: 'flickr-photos.json', name: 'flickr-api-sample.json' },
  { file: 'trakt.json', name: 'trakt-api-sample.json' }
];

sources.forEach(source => {
  const sourcePath = path.join(DATA_DIR, source.file);
  const targetPath = path.join(FIXTURE_DIR, source.name);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Recorded fixture: ${source.name}`);
  } else {
    console.log(`⚠️ Skip: ${source.file} not found. Run 'npm run fetch' first.`);
  }
});
