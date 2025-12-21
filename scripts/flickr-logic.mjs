export function transformFlickrData(apiResponse) {
  const rawPhotos = apiResponse?.photos?.photo || [];

  return rawPhotos.map(p => ({
    id: p.id,
    title: p.title || '',
    src: p.url_m || p.url_l || '',
    date: p.datetaken || '',
    tags: p.tags ? p.tags.split(' ') : [],
  }));
}
