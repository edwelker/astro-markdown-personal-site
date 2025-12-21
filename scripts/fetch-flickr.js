import fs from 'fs';
import path from 'path';
import { transformFlickrData } from './flickr-logic.mjs';

async function runFetcher() {
  // Ensure the API key is present before trying to fetch
  if (!process.env.FLICKR_API_KEY) {
    console.error('Error: FLICKR_API_KEY is not defined.');
    return;
  }

  const url = `https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${process.env.FLICKR_API_KEY}&user_id=72923429@N00&format=json&nojsoncallback=1&extras=url_m,url_l,date_taken,tags`;

  try {
    // Action 1: Network request (Side Effect)
    const response = await fetch(url);
    const rawData = await response.json();

    // Action 2: Data Cleaning (Pure Logic - tested in isolation)
    const cleanData = transformFlickrData(rawData);

    // Action 3: Disk I/O (Side Effect)
    const outputPath = path.resolve('src/data/flickr-photos.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(cleanData, null, 2));
    
    console.log(`Successfully synced ${cleanData.length} photos.`);
  } catch (error) {
    // Fail gracefully: Log the error so the build continues.
    console.error('Flickr Sync Failed:', error.message);
  }
}

runFetcher();
