export const transformStravaData = (activities, currentDate = new Date()) => {
  const TIMEZONE = 'America/New_York';
  const now = currentDate;

  // Helper to get date parts in specific timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: TIMEZONE,
  });

  const getDateParts = (date) => {
    const parts = formatter.formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type).value;
    return {
      year: parseInt(get('year')),
      month: parseInt(get('month')) - 1, // 0-indexed
      day: parseInt(get('day')),
    };
  };

  const { year: currentYear, month: currentMonth } = getDateParts(now);

  // Normalize input to ensure it's an array
  const safeActivities = Array.isArray(activities) ? activities : [];

  // Totals use all cycling types, including indoor/virtual
  const CYCLING_TYPES = new Set([
    'Ride',
    'GravelRide',
    'MountainBikeRide',
    'VirtualRide',
    'EBikeRide',
    'Handcycle',
    'Velomobile',
    'Unicycle',
    'Wheelchair',
  ]);

  const cycling = safeActivities.filter((a) => CYCLING_TYPES.has(a.sport_type || a.type));

  let ytdDist = 0,
    ytdElev = 0,
    monthDist = 0;
  let prevMonthDist = 0;
  let yearCount = 0;

  // Determine previous month index
  let prevMonthIndex = currentMonth - 1;
  let prevMonthYear = currentYear;
  if (prevMonthIndex < 0) {
    prevMonthIndex = 11;
    prevMonthYear = currentYear - 1;
  }

  const weeklyMiles = new Array(52).fill(0);

  cycling.forEach((ride) => {
    const d = new Date(ride.start_date);
    const { year: rideYear, month: rideMonth } = getDateParts(d);

    const miles = ride.distance * 0.000621371;
    const feet = ride.total_elevation_gain * 3.28084;

    if (rideYear === currentYear) {
      ytdDist += miles;
      ytdElev += feet;
      yearCount++;

      // Calculate week index based on day of year in local time
      const parts = formatter.formatToParts(d);

      const rYear = parseInt(parts.find((p) => p.type === 'year').value);
      const rMonth = parseInt(parts.find((p) => p.type === 'month').value) - 1;
      const rDay = parseInt(parts.find((p) => p.type === 'day').value);

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
    }

    if (rideYear === currentYear && rideMonth === currentMonth) {
      monthDist += miles;
    }
    if (rideYear === prevMonthYear && rideMonth === prevMonthIndex) {
      prevMonthDist += miles;
    }
  });

  // Recent List: Strict filter for outdoor, non-trainer, non-virtual rides
  // Use all fetched activities (cycling) to populate recent list even if from prev year
  const recentRides = cycling
    .filter((a) => {
      const isVirtual = a.sport_type === 'VirtualRide' || a.type === 'VirtualRide';
      const isTrainer = a.trainer === true;
      const isPublic = a.visibility !== 'only_me';
      const hasElevation = a.total_elevation_gain > 0;
      return !isVirtual && !isTrainer && isPublic && hasElevation;
    })
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    .slice(0, 10)
    .map((a) => ({
      name: a.name,
      date: new Date(a.start_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: TIMEZONE,
      }),
      distance: (a.distance * 0.000621371).toFixed(1),
      elevation: Math.round(a.total_elevation_gain * 3.28084).toLocaleString(),
      id: a.id,
    }));

  // Decide which month to show
  let displayMonthName = now.toLocaleDateString('en-US', { month: 'long', timeZone: TIMEZONE });
  let displayMonthDist = monthDist;
  let showMonth = true;

  // If current month has 0 distance, show previous month
  if (monthDist === 0) {
    // Use the calculated previous month/year to ensure consistency with NY time
    // Pick the 15th of the month to be safe from timezone rollovers when formatting
    const prevDate = new Date(Date.UTC(prevMonthYear, prevMonthIndex, 15));
    displayMonthName = prevDate.toLocaleDateString('en-US', { month: 'long', timeZone: TIMEZONE });
    displayMonthDist = prevMonthDist;

    // If we fell back to previous month, and it's the previous year (Dec),
    // and we have no distance (likely meaning data wasn't fetched), hide it.
    if (prevMonthYear < currentYear && displayMonthDist === 0) {
      showMonth = false;
    }
  }

  return {
    year: {
      distance: ytdDist.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      elevation: Math.round(ytdElev).toLocaleString(),
      count: yearCount,
    },
    month: showMonth
      ? {
          name: displayMonthName,
          distance: displayMonthDist.toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
        }
      : null,
    recent: recentRides,
    chart: weeklyMiles.map((m) => Math.round(m)),
  };
};
