import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIXTURE_DIR = './tests/fixtures';
export const DATA_DIR = './src/data';
export const FILES_TO_RECORD = ['flickr-photos.json', 'trakt.json', 'cycling.json', 'music.json'];

export async function record() {
  await fs.mkdir(FIXTURE_DIR, { recursive: true });
  for (const file of FILES_TO_RECORD) {
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  record();
}
