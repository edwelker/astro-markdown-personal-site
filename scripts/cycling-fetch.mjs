import { runETL } from './lib-etl.mjs';
import { transformStravaData } from './cycling-logic.mjs';

export async function getStravaAccessToken({ clientId, clientSecret, refreshToken }) {
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and STRAVA_REFRESH_TOKEN must be set');
  }
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });
  if (!res.ok) throw new Error(`Strava auth failed: HTTP ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export async function fetchCyclingData({ token }) {
  const YEAR = new Date().getFullYear();
  const allActivities = [];
  let page = 1;

  while (true) {
    const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error(`Strava activities fetch failed: HTTP ${res.status}`);
    }
    
    const list = await res.json();
    if (list.length === 0) {
      break;
    }

    for (const a of list) {
      const rideYear = new Date(a.start_date).getFullYear();
      if (rideYear < YEAR) {
        return allActivities;
      }
      allActivities.push(a);
    }
    page++;
  }
  return allActivities;
}

export async function run() {
  await runETL({
    name: 'Strava',
    fetcher: async () => {
      const token = await getStravaAccessToken({
        clientId: process.env.STRAVA_CLIENT_ID,
        clientSecret: process.env.STRAVA_CLIENT_SECRET,
        refreshToken: process.env.STRAVA_REFRESH_TOKEN,
      });
      return fetchCyclingData({ token });
    },
    transform: transformStravaData,
    outFile: 'src/data/cycling.json'
  });
}

// This allows the script to be run directly, or imported by a parallel runner.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  run();
}
