// scripts/fetch-flickr.js

import fs from 'fs';
import path from 'path';

// --- CONFIGURATION: REPLACE THESE VALUES ---
// 1. Your Flickr API Key
const FLICKR_API_KEY = process.env.FLICKR_API_KEY;
// 2. Your Flickr User ID
const FLICKR_USER_ID = '72923429@N00';
// The number of photos to fetch
const PHOTO_COUNT = 10;
// The output file path (Astro will read this)
const OUTPUT_FILE = path.resolve('src/data/flickr-photos.json');
// ------------------------------------------

// Flickr API method to get public photos
const url = `https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${FLICKR_API_KEY}&user_id=${FLICKR_USER_ID}&per_page=${PHOTO_COUNT}&format=json&nojsoncallback=1&extras=url_m,url_l,date_taken,tags`;

async function fetchFlickrPhotos() {
  if (!FLICKR_API_KEY) {
    console.error("Error: FLICKR_API_KEY environment variable is not set.");
    return;
  }

  console.log(`Fetching ${PHOTO_COUNT} photos from Flickr...`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.stat !== 'ok') {
      console.error('Flickr API Error:', data.message);
      return;
    }

    const photos = data.photos.photo.map(p => ({
      id: p.id,
      title: p.title,
      // Use 'url_m' for medium size for quick loading
      src: p.url_m || p.url_l,
      date: p.datetaken,
      tags: p.tags.split(' '),
    }));

    // Ensure the output directory exists
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

    // Write the data to the JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photos, null, 2));

    console.log(`Successfully fetched and saved ${photos.length} photos to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error fetching Flickr photos:', error);
  }
}

fetchFlickrPhotos();
