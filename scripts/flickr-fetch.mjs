import { runETL } from './lib-etl.mjs';
import { transformFlickrData } from './flickr-logic.mjs';
import { validateEnv } from './lib-credentials.mjs';
import { fetchOrThrow, runIfMain } from './lib-utils.mjs';

export async function fetchFlickrData(apiKey) {
  const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&user_id=72923429@N00&format=json&nojsoncallback=1&extras=url_m,width_m,height_m,date_taken,tags&sort=date-taken-desc`;
  const response = await fetchOrThrow(url);
  return response.json();
}

export async function run() {
  const { apiKey } = validateEnv(
    {
      apiKey: 'FLICKR_API_KEY',
    },
    'Flickr'
  );

  await runETL({
    name: 'Flickr',
    fetcher: () => fetchFlickrData(apiKey),
    transform: transformFlickrData,
    outFile: 'src/data/flickr-photos.json',
    defaultData: [],
  });
}

runIfMain(import.meta.url, run);
