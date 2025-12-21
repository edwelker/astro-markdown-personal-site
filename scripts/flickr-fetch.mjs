import { runETL } from './lib-etl.mjs';
import { transformFlickrData } from './flickr-logic.mjs';

runETL({
  name: 'Flickr',
  // Added o_dims and width_m, height_m to extras
  url: `https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${process.env.FLICKR_API_KEY}&user_id=72923429@N00&format=json&nojsoncallback=1&extras=url_m,width_m,height_m,date_taken,tags`,
  transform: transformFlickrData,
  outFile: 'src/data/flickr-photos.json',
  defaultData: []
});
