export const transformStravaData = (activities) => {
  const now = new Date();
  if (!Array.isArray(activities)) {
    return {
      year: { distance: '0', elevation: '0', count: 0 },
      month: { name: now.toLocaleDateString('en-US', { month: 'long' }), distance: 0 },
      recent: [],
      chart: Array(52).fill(0)
    };
  }

  const year = now.getFullYear();
  
  // Totals use all cycling types
  const cycling = activities.filter(a => ['Ride', 'GravelRide', 'MountainBikeRide', 'VirtualRide', 'EBikeRide'].includes(a.sport_type || a.type));
  const cyclingThisYear = cycling.filter(a => new Date(a.start_date).getFullYear() === year);
  
  let ytdDist = 0, ytdElev = 0, monthDist = 0;
  const weeklyMiles = new Array(52).fill(0);

  cyclingThisYear.forEach(ride => {
    const d = new Date(ride.start_date);
    
    const miles = ride.distance * 0.000621371;
    const feet = ride.total_elevation_gain * 3.28084;
    
    ytdDist += miles;
    ytdElev += feet;
    if (d.getMonth() === now.getMonth()) monthDist += miles;
    
    const startOfYear = new Date(year, 0, 1);
    const weekIndex = Math.floor((d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24 * 7));
    if (weekIndex >= 0 && weekIndex < 52) weeklyMiles[weekIndex] += miles;
  });

  // Recent List: Strict filter for outdoor, non-trainer, non-virtual rides
  const recentRides = cyclingThisYear
    .filter(a => {
      const isVirtual = a.sport_type === 'VirtualRide' || a.type === 'VirtualRide';
      const isTrainer = a.trainer === true;
      const isPublic = a.visibility !== 'only_me';
      const hasElevation = a.total_elevation_gain > 0;
      return !isVirtual && !isTrainer && isPublic && hasElevation;
    })
    .slice(0, 10)
    .map(a => ({
      name: a.name,
      date: new Date(a.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      distance: (a.distance * 0.000621371).toFixed(1),
      elevation: Math.round(a.total_elevation_gain * 3.28084).toLocaleString(),
      id: a.id
    }));

  return {
    year: {
      distance: Math.round(ytdDist).toLocaleString(),
      elevation: Math.round(ytdElev).toLocaleString(),
      count: cyclingThisYear.length
    },
    month: {
      name: now.toLocaleDateString('en-US', { month: 'long' }),
      distance: Math.round(monthDist)
    },
    recent: recentRides,
    chart: weeklyMiles.map(m => Math.round(m))
  };
};
