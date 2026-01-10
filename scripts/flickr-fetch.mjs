import { runETL } from './lib-etl.mjs';
import { transformFlickrData } from './flickr-logic.mjs';
import { validateEnv } from './lib-credentials.mjs';

export async function fetchFlickrData(apiKey) {
  const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&user_id=72923429@N00&format=json&nojsoncallback=1&extras=url_m,width_m,height_m,date_taken,tags&sort=date-taken-desc`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function run() {
  const { apiKey } = validateEnv({
    apiKey: 'FLICKR_API_KEY'
  }, 'Flickr');

  await runETL({
    name: 'Flickr',
    fetcher: () => fetchFlickrData(apiKey),
    transform: transformFlickrData,
    outFile: 'src/data/flickr-photos.json',
    defaultData: []
  });
}

// This allows the script to be run directly, or imported by a parallel runner.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  run();
}
