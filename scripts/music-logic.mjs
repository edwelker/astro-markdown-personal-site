export function transformMusicData(
  info,
  recent,
  wArt,
  wAlb,
  wTrk,
  mArt,
  mAlb,
  mTrk,
  yArt,
  yAlb,
  yTrk,
  oArt,
  oAlb,
  oTrk
) {
  const getItems = (data) => {
    const list = data?.topartists?.artist || data?.topalbums?.album || data?.toptracks?.track || [];
    // Handle single item case (Last.fm API quirk where single result is object, not array)
    const array = Array.isArray(list) ? list : [list];
    return array.map((item) => ({
      name: item.name,
      url: item.url,
      artist: item.artist?.name || undefined,
      plays: item.playcount,
      image: item.image?.find((i) => i.size === 'extralarge')?.['#text'] || '',
    }));
  };

  // Helper to format YYYY-MM-DD string in user's Eastern timezone
  const getLocalDateKey = (dateObj) => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  };

  const getLocalDayName = (dateObj) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
    }).format(dateObj);
  };

  const processHistory = () => {
    const daysMap = {};
    const rawTracks = recent?.recenttracks?.track;

    // 1. Process all available tracks into the map first
    if (rawTracks && !recent.error) {
      const tracks = Array.isArray(rawTracks) ? rawTracks : [rawTracks];

      tracks.forEach((t) => {
        if (t['@attr']?.nowplaying) return;
        const ts = parseInt(t.date?.uts);
        if (!ts) return;

        // Convert UTC timestamp to local Eastern date key
        const dateObj = new Date(ts * 1000);
        const date = getLocalDateKey(dateObj);

        if (!daysMap[date]) daysMap[date] = { count: 0, artists: {} };

        daysMap[date].count += 1;
        const artist = t.artist['#text'];
        daysMap[date].artists[artist] = (daysMap[date].artists[artist] || 0) + 1;
      });
    }

    // 2. Determine the 7-day window in America/New_York
    // If "Today" has no data yet (e.g. 12:01 AM), shift the window back by 1 day
    // so we don't show an empty graph.
    const now = new Date();
    const todayKey = getLocalDateKey(now);

    const [y, m, d] = todayKey.split('-').map(Number);
    // Use noon UTC to step calendar days cleanly without timezone/DST edge-case shifting
    const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    if (!daysMap[todayKey] || daysMap[todayKey].count === 0) {
      anchor.setUTCDate(anchor.getUTCDate() - 1);
    }

    // 3. Build the history array for the chosen window
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const current = new Date(anchor);
      current.setUTCDate(anchor.getUTCDate() - i);
      const dateStr = getLocalDateKey(current);

      // Calculate comparison date (7 days prior)
      const past = new Date(current);
      past.setUTCDate(past.getUTCDate() - 7);
      const dateStrLast = getLocalDateKey(past);

      const thisDayData = daysMap[dateStr];
      const lastDayData = daysMap[dateStrLast];

      // Find top artist for the day
      let topArtist = null;
      let maxPlays = 0;
      if (thisDayData) {
        Object.entries(thisDayData.artists).forEach(([art, count]) => {
          if (count > maxPlays) {
            maxPlays = count;
            topArtist = art;
          }
        });
      }

      history.push({
        dayName: getLocalDayName(current),
        date: dateStr,
        hours: (((thisDayData?.count || 0) * 3.5) / 60).toFixed(1),
        lastHours: (((lastDayData?.count || 0) * 3.5) / 60).toFixed(1),
        topArtist,
      });
    }

    return history;
  };

  return {
    user: { scrobbles: parseInt(info?.user?.playcount || 0) },
    history: processHistory(),
    week: { artists: getItems(wArt), albums: getItems(wAlb), tracks: getItems(wTrk) },
    month: { artists: getItems(mArt), albums: getItems(mAlb), tracks: getItems(mTrk) },
    year: { artists: getItems(yArt), albums: getItems(yAlb), tracks: getItems(yTrk) },
    allTime: { artists: getItems(oArt), albums: getItems(oAlb), tracks: getItems(oTrk) },
  };
}
