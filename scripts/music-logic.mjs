export const transformMusicData = (userData, weekArt, weekAlb, monthArt, monthAlb) => {
  const mapArtist = (data) => (data?.topartists?.artist || []).map(a => ({
    name: a.name, 
    url: a.url, 
    plays: a.playcount
  }));

  const mapAlbum = (data) => (data?.topalbums?.album || []).map(a => ({
    name: a.name, 
    artist: a.artist?.name, 
    url: a.url, 
    plays: a.playcount, 
    image: a.image?.[3]?.['#text'] || a.image?.[2]?.['#text'] || ''
  }));

  return {
    user: { 
      scrobbles: parseInt(userData?.user?.playcount || 0) 
    },
    week: { 
      artists: mapArtist(weekArt), 
      albums: mapAlbum(weekAlb) 
    },
    month: { 
      artists: mapArtist(monthArt), 
      albums: mapAlbum(monthAlb) 
    }
  };
};
