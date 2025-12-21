export function deduplicate(items) {
  const uniqueMap = new Map();
  items.forEach(item => {
    const id = item.movie?.ids?.imdb || item.show?.ids?.imdb;
    if (id && !uniqueMap.has(id)) {
      uniqueMap.set(id, item);
    }
  });
  return Array.from(uniqueMap.values());
}

export function calculateDecade(year) {
  return Math.floor(year / 10) * 10;
}
