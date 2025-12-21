import fs from 'fs';
import path from 'path';
import { transformFlickrData } from './flickr-logic.mjs';

const FLICKR_API_KEY = process.env.FLICKR_API_KEY;
const FLICKR_USER_ID = '72923429@N00';
const PHOTO_COUNT = 10;
const OUTPUT_FILE = path.resolve('src/data/flickr-photos.json');

const url = `https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&per_page=${PHOTO_COUNT}&format=json&nojsoncallback=1&extras=url_m,url_l,date_taken,tags`;

async function fetchFlickrPhotos() {
  if (!FLICKR_API_KEY) return console.error("Missing FLICKR_API_KEY");

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.stat !== 'ok') return console.error('Flickr Error:', data.message);

    // ACT: The side-effect-free transformation
    const photos = transformFlickrData(data);

    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photos, null, 2));
    console.log(`Saved ${photos.length} photos.`);
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

fetchFlickrPhotos();
