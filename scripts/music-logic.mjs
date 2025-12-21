export function transformMusicData(info, weekArtists, weekAlbums, monthArtists, monthAlbums) {
  const getItems = (data) => {
    const list = data?.topartists?.artist || data?.topalbums?.album || [];
    return list.map(item => ({
      name: item.name,
      url: item.url,
      artist: item.artist?.name || undefined,
      plays: item.playcount,
      image: item.image?.find(i => i.size === 'extralarge')?.['#text'] || ""
    }));
  };

  return {
    user: { scrobbles: parseInt(info?.user?.playcount || 0) },
    week: { artists: getItems(weekArtists), albums: getItems(weekAlbums) },
    month: { artists: getItems(monthArtists), albums: getItems(monthAlbums) }
  };
}
