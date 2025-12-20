import fs from 'node:fs/promises';
import path from 'node:path';

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const OUT_FILE = path.join(process.cwd(), 'src', 'data', 'cycling.json');

const MIN_MILES = 15;
const NOW = new Date();
const YEAR = NOW.getFullYear();

async function getAccessToken() {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Auth Failed: ${data.message}`);
  return data.access_token;
}

async function fetchStravaData() {
  if (!REFRESH_TOKEN) return console.warn("⚠️ No Refresh Token found.");

  try {
    const token = await getAccessToken();
    let allActivities = [];
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const activities = await res.json();
      if (!res.ok || activities.length === 0) { keepFetching = false; break; }

      for (const activity of activities) {
        const rideDate = new Date(activity.start_date);
        if (rideDate.getFullYear() < YEAR) { keepFetching = false; break; }
        if (rideDate.getFullYear() === YEAR) allActivities.push(activity);
      }
      page++;
      if (page > 10) keepFetching = false;
    }

    const currentMonth = NOW.getMonth();
    let ytdDist = 0, ytdElev = 0, ytdCount = 0;
    let monthDist = 0, monthCount = 0;
    const weeklyMiles = new Array(52).fill(0);

    // 1. Calculate Totals (Inclusive of all cycling)
    allActivities.forEach(ride => {
      const cyclingSports = ['Ride', 'MountainBikeRide', 'GravelRide', 'EBikeRide', 'VirtualRide'];
      const isCycling = cyclingSports.includes(ride.sport_type) || cyclingSports.includes(ride.type);

      if (isCycling) {
        const miles = ride.distance * 0.000621371;
        const feet = ride.total_elevation_gain * 3.28084;
        const rideDate = new Date(ride.start_date);

        ytdDist += miles;
        ytdElev += feet;
        ytdCount++;

        if (rideDate.getMonth() === currentMonth) {
          monthDist += miles;
          monthCount++;
        }

        const startOfYear = new Date(YEAR, 0, 1);
        const diffInMs = rideDate - startOfYear;
        const weekIndex = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));
        if (weekIndex >= 0 && weekIndex < 52) {
          weeklyMiles[weekIndex] += miles;
        }
      }
    });

    // 2. Filter Recent List (Strictly outdoor/significant rides)
    const recentDisplayRides = allActivities
      .filter(a => {
        const outdoorSports = ['Ride', 'MountainBikeRide', 'GravelRide', 'EBikeRide'];
        const isOutdoorType = outdoorSports.includes(a.sport_type) || outdoorSports.includes(a.type);
        const isVirtual = a.sport_type === 'VirtualRide' || a.type === 'VirtualRide';
        const isTrainer = a.trainer === true;
        const isVisible = a.visibility !== 'only_me';
        return isOutdoorType && !isVirtual && !isTrainer && isVisible;
      })
      .filter(a => (a.distance * 0.000621371) > MIN_MILES)
      .slice(0, 3)
      .map(a => ({
        name: a.name,
        date: new Date(a.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        distance: (a.distance * 0.000621371).toFixed(1),
        elevation: Math.round(a.total_elevation_gain * 3.28084).toLocaleString(),
        id: a.id
      }));

    const output = {
      year: {
        distance: Math.round(ytdDist).toLocaleString(),
        elevation: Math.round(ytdElev).toLocaleString(),
        count: ytdCount
      },
      month: {
        name: NOW.toLocaleDateString('en-US', { month: 'long' }),
        distance: Math.round(monthDist),
        count: monthCount
      },
      recent: recentDisplayRides,
      chart: weeklyMiles.map(m => Math.round(m))
    };

    await fs.writeFile(OUT_FILE, JSON.stringify(output, null, 2));
    console.log(`✅ Success: Aggregated ${ytdCount} rides.`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

fetchStravaData();
