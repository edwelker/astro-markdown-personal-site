import { runETL } from './lib-etl.mjs';
import { transformFlickrData } from './flickr-logic.mjs';

export async function fetchFlickrData() {
  const url = `https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${process.env.FLICKR_API_KEY}&user_id=72923429@N00&format=json&nojsoncallback=1&extras=url_m,width_m,height_m,date_taken,tags`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function run() {
  await runETL({
    name: 'Flickr',
    fetcher: fetchFlickrData,
    transform: transformFlickrData,
    outFile: 'src/data/flickr-photos.json',
    defaultData: []
  });
}

// This allows the script to be run directly, or imported by a parallel runner.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  run();
}
