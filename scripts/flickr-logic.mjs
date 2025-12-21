/**
 * transformFlickrData
 * Converts raw Flickr API responses into a clean format for the Astro UI.
 * * @param {Object} apiResponse - The raw JSON from the Flickr API
 * @returns {Array} A mapped array of photo objects with safe fallbacks
 */
export function transformFlickrData(apiResponse) {
  // Use optional chaining to safely access the photo array or default to empty
  const rawPhotos = apiResponse?.photos?.photo ?? [];
  
  return rawPhotos.map(p => ({
    id: p.id,
    title: p.title || 'Untitled',
    // Prefer medium (url_m), fallback to large (url_l), then empty string
    src: p.url_m ?? p.url_l ?? '',
    date: p.datetaken ?? '',
    // Convert the space-separated tag string into a usable array
    tags: p.tags ? p.tags.split(' ') : []
  }));
}
