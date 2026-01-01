export const transformStravaData = (activities) => {
  const TIMEZONE = 'America/New_York';
  const now = new Date();

  // Helper to get date parts in specific timezone
  const getDateParts = (date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: TIMEZONE
    });
    const parts = formatter.formatToParts(date);
    const get = (type) => parts.find(p => p.type === type).value;
    return {
      year: parseInt(get('year')),
      month: parseInt(get('month')) - 1, // 0-indexed
      day: parseInt(get('day'))
    };
  };

  const { year: currentYear, month: currentMonth } = getDateParts(now);

  if (!Array.isArray(activities)) {
    return {
      year: { distance: '0', elevation: '0', count: 0 },
      month: { name: now.toLocaleDateString('en-US', { month: 'long', timeZone: TIMEZONE }), distance: 0 },
      recent: [],
      chart: Array(52).fill(0)
    };
  }

  // Totals use all cycling types
  const cycling = activities.filter(a => ['Ride', 'GravelRide', 'MountainBikeRide', 'VirtualRide', 'EBikeRide'].includes(a.sport_type || a.type));
  
  // Filter for this year (in user's timezone)
  const cyclingThisYear = cycling.filter(a => {
    const rideDate = new Date(a.start_date);
    const { year: rideYear } = getDateParts(rideDate);
    return rideYear === currentYear;
  });
  
  let ytdDist = 0, ytdElev = 0, monthDist = 0;
  const weeklyMiles = new Array(52).fill(0);

  cyclingThisYear.forEach(ride => {
    const d = new Date(ride.start_date);
    const { month: rideMonth } = getDateParts(d);
    
    const miles = ride.distance * 0.000621371;
    const feet = ride.total_elevation_gain * 3.28084;
    
    ytdDist += miles;
    ytdElev += feet;
    if (rideMonth === currentMonth) monthDist += miles;
    
    // Calculate week index based on day of year in local time
    const parts = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: TIMEZONE
    }).formatToParts(d);
    
    const rYear = parseInt(parts.find(p => p.type === 'year').value);
    const rMonth = parseInt(parts.find(p => p.type === 'month').value) - 1;
    const rDay = parseInt(parts.find(p => p.type === 'day').value);
    
    // Construct a date object that represents this local time as if it were UTC
    const localAsUtc = new Date(Date.UTC(rYear, rMonth, rDay));
    const startOfYearLocalAsUtc = new Date(Date.UTC(currentYear, 0, 1));
    
    const diffMs = localAsUtc - startOfYearLocalAsUtc;
    const weekIndex = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

    if (weekIndex >= 0 && weekIndex < 52) {
      weeklyMiles[weekIndex] += miles;
    } else if (weekIndex === 52) {
      weeklyMiles[51] += miles;
    }
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
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    .slice(0, 10)
    .map(a => ({
      name: a.name,
      date: new Date(a.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: TIMEZONE }),
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
      name: now.toLocaleDateString('en-US', { month: 'long', timeZone: TIMEZONE }),
      distance: Math.round(monthDist)
    },
    recent: recentRides,
    chart: weeklyMiles.map(m => Math.round(m))
  };
};
