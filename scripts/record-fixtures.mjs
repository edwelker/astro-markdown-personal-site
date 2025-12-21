import fs from 'node:fs/promises';
import path from 'node:path';

const FIXTURE_DIR = './tests/fixtures';
const DATA_DIR = './src/data';

async function record() {
  await fs.mkdir(FIXTURE_DIR, { recursive: true });
  const files = ['flickr-photos.json', 'trakt.json', 'cycling.json', 'music.json'];
  for (const file of files) {
    const src = path.join(DATA_DIR, file);
    const dest = path.join(FIXTURE_DIR, `sample-${file}`);
    try {
      await fs.copyFile(src, dest);
      console.log(`📸 Recorded: ${file}`);
    } catch {
      console.warn(`⚠️ Skip: ${file} not found.`);
    }
  }
}
record();
