import fs from 'node:fs/promises';
import { transformStravaData } from './strava-logic.mjs';

async function getAccessToken() {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`auth failed: ${data.message}`);
  return data.access_token;
}

async function run() {
  const year = new Date().getFullYear();
  try {
    const token = await getAccessToken();
    let allActivities = [];
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
      console.log(`fetching strava page ${page}...`);
      const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activities = await res.json();
      if (!res.ok || activities.length === 0) break;

      for (const activity of activities) {
        const rideDate = new Date(activity.start_date);
        if (rideDate.getFullYear() < year) { keepFetching = false; break; }
        if (rideDate.getFullYear() === year) allActivities.push(activity);
      }
      page++;
      if (page > 10) break;
    }

    const cleanData = transformStravaData(allActivities);
    await fs.writeFile('src/data/cycling.json', JSON.stringify(cleanData, null, 2));
    console.log(`✅ strava: synced ${allActivities.length} rides.`);
  } catch (e) {
    console.error('❌ strava failed:', e.message);
  }
}
run();
