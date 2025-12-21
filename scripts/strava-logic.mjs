export const transformStravaData = (activities) => {
  if (!Array.isArray(activities)) return { year: { distance: "0", elevation: "0", count: 0 }, month: { name: "", distance: 0 }, recent: [], chart: [] };
  const now = new Date();
  const year = now.getFullYear();
  const cycling = activities.filter(a => ['Ride', 'GravelRide', 'MountainBikeRide', 'VirtualRide'].includes(a.sport_type || a.type));
  
  let ytdDist = 0, ytdElev = 0, monthDist = 0;
  const weeklyMiles = new Array(52).fill(0);

  cycling.forEach(ride => {
    const d = new Date(ride.start_date);
    if (d.getFullYear() !== year) return;
    const miles = ride.distance * 0.000621371;
    const feet = ride.total_elevation_gain * 3.28084;
    ytdDist += miles;
    ytdElev += feet;
    if (d.getMonth() === now.getMonth()) monthDist += miles;
    const startOfYear = new Date(year, 0, 1);
    const weekIndex = Math.floor((d - startOfYear) / (1000 * 60 * 60 * 24 * 7));
    if (weekIndex >= 0 && weekIndex < 52) weeklyMiles[weekIndex] += miles;
  });

  return {
    year: { distance: Math.round(ytdDist).toLocaleString(), elevation: Math.round(ytdElev).toLocaleString(), count: cycling.length },
    month: { name: now.toLocaleDateString('en-US', { month: 'long' }), distance: Math.round(monthDist) },
    recent: cycling.slice(0, 3).map(a => ({
      name: a.name, date: new Date(a.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      distance: (a.distance * 0.000621371).toFixed(1), elevation: Math.round(a.total_elevation_gain * 3.28084).toLocaleString(), id: a.id
    })),
    chart: weeklyMiles.map(m => Math.round(m)),
    _raw: activities.slice(0, 100)
  };
};
