export const transformFlickrData = (data) => {
  const photos = data?.photos?.photo ?? [];
  return photos.map(p => ({
    id: p.id, title: p.title || 'Untitled', src: p.url_m ?? p.url_l ?? '', date: p.datetaken ?? '', tags: p.tags ? p.tags.split(' ') : []
  }));
};
