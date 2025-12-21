import fs from 'fs';
import path from 'path';

async function record() {
  const apiKey = process.env.FLICKR_API_KEY;
  const url = `https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${apiKey}&user_id=72923429@N00&format=json&nojsoncallback=1&extras=url_m,url_l,date_taken,tags`;

  console.log('Fetching fresh snapshot from Flickr...');
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const fixturePath = path.resolve('tests/fixtures/flickr-api-sample.json');
    fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
    fs.writeFileSync(fixturePath, JSON.stringify(data, null, 2));
    
    console.log('✅ New fixture recorded to tests/fixtures/flickr-api-sample.json');
  } catch (e) {
    console.error('❌ Failed to record fixture:', e.message);
    process.exit(1);
  }
}

record();
