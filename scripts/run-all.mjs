import { run as runCycling } from './cycling-fetch.mjs';
import { run as runMusic } from './music-fetch.mjs';
import { run as runTrakt } from './trakt-fetch.mjs';
import { run as runFlickr } from './flickr-fetch.mjs';
import { run as runGas } from './gas-fetch.mjs';

async function runAll() {
  console.log('🔥 Starting all data fetch scripts...');
  const start = Date.now();
  
  // Run all fetchers concurrently
  // Each fetcher uses runETL which handles caching/fallback internally
  await Promise.all([
    runCycling(),
    runMusic(),
    runTrakt(),
    runFlickr(),
    runGas()
  ]);
  
  const duration = (Date.now() - start) / 1000;
  console.log(`\n🎉 All scripts finished in ${duration.toFixed(2)}s.`);
}

runAll();
