/**
 * transformFlickrData
 * Pure function to map raw API responses to UI objects.
 * Separated from network/IO for Vitest reliability.
 */
export function transformFlickrData(apiResponse) {
  const rawPhotos = apiResponse?.photos?.photo ?? [];
  return rawPhotos.map(p => ({
    id: p.id,
    title: p.title || 'Untitled',
    src: p.url_m ?? p.url_l ?? '',
    date: p.datetaken ?? '',
    tags: p.tags ? p.tags.split(' ') : []
  }));
}
