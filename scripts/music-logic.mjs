export function transformMusicData(info, wArt, wAlb, wTrk, mArt, mAlb, mTrk, yArt, yAlb, yTrk, oArt, oAlb, oTrk) {
  const getItems = (data) => {
    const list = data?.topartists?.artist || data?.topalbums?.album || data?.toptracks?.track || [];
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
    week: { artists: getItems(wArt), albums: getItems(wAlb), tracks: getItems(wTrk) },
    month: { artists: getItems(mArt), albums: getItems(mAlb), tracks: getItems(mTrk) },
    year: { artists: getItems(yArt), albums: getItems(yAlb), tracks: getItems(yTrk) },
    allTime: { artists: getItems(oArt), albums: getItems(oAlb), tracks: getItems(oTrk) }
  };
}
