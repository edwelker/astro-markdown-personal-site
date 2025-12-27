import { run as runCycling } from './cycling-fetch.mjs';
import { run as runMusic } from './music-fetch.mjs';
import { run as runTrakt } from './trakt-fetch.mjs';
import { run as runFlickr } from './flickr-fetch.mjs';

async function runAll() {
  console.log('🔥 Starting all data fetch scripts...');
  const start = Date.now();
  
  await Promise.all([
    runCycling(),
    runMusic(),
    runTrakt(),
    runFlickr()
  ]);
  
  const duration = (Date.now() - start) / 1000;
  console.log(`\n🎉 All scripts finished in ${duration.toFixed(2)}s.`);
}

runAll();
