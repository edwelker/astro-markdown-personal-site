import fs from 'node:fs/promises';
import { transformStravaData } from './cycling-logic.mjs';

async function getAccessToken() {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  return data.access_token;
}

async function run() {
  try {
    const token = await getAccessToken();
    const YEAR = new Date().getFullYear();
    let allActivities = [];
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
      const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      if (!res.ok || list.length === 0) break;

      for (const a of list) {
        const rideYear = new Date(a.start_date).getFullYear();
        if (rideYear < YEAR) {
          keepFetching = false;
          break;
        }
        allActivities.push(a);
      }
      page++;
    }

    const clean = transformStravaData(allActivities);
    await fs.writeFile('src/data/cycling.json', JSON.stringify(clean, null, 2));
    console.log(`✅ Strava: Processed ${allActivities.length} rides for YTD.`);
  } catch (e) {
    console.error('❌ Strava Failed:', e.message);
  }
}
run();
