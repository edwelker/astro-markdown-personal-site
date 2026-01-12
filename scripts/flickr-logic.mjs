export const transformFlickrData = (data) => {
  const photos = data?.photos?.photo ?? [];
  return photos.map((p) => {
    // API provides url_m (medium) and its dimensions
    const width = parseInt(p.width_m || '1');
    const height = parseInt(p.height_m || '1');

    return {
      id: p.id,
      title: p.title || 'Untitled',
      src: p.url_m ?? p.url_l ?? '',
      date: p.datetaken ?? '',
      tags: p.tags ? p.tags.split(' ').filter(Boolean) : [],
      aspect: width / height,
      isLandscape: width > height,
      isPortrait: height > width,
    };
  });
};
