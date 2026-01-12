import { runETL } from './lib-etl.mjs';
import { transformStravaData } from './cycling-logic.mjs';
import { validateEnv } from './lib-credentials.mjs';
import { fetchOrThrow, runIfMain } from './lib-utils.mjs';

export async function getStravaAccessToken({ clientId, clientSecret, refreshToken }) {
  const res = await fetchOrThrow('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  return data.access_token;
}

export async function fetchCyclingData({ token }) {
  const now = new Date();
  // Fetch 15 months of history to ensure we have context for the start of the year
  // and plenty of buffer for previous month calculations
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - 15, now.getDate());

  const allActivities = [];
  let page = 1;
  let keepFetching = true;

  while (keepFetching) {
    const res = await fetchOrThrow(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=100`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const list = await res.json();
    if (list.length === 0) {
      break; // Exit while loop if no more activities
    }

    for (const a of list) {
      const rideDate = new Date(a.start_date);

      if (rideDate >= cutoffDate) {
        allActivities.push(a);
      } else {
        keepFetching = false;
        break;
      }
    }
    page++;
  }
  return allActivities;
}

export async function run() {
  const creds = validateEnv(
    {
      clientId: 'STRAVA_CLIENT_ID',
      clientSecret: 'STRAVA_CLIENT_SECRET',
      refreshToken: 'STRAVA_REFRESH_TOKEN',
    },
    'Strava'
  );

  await runETL({
    name: 'Strava',
    fetcher: async () => {
      const token = await getStravaAccessToken(creds);
      return fetchCyclingData({ token });
    },
    transform: transformStravaData,
    outFile: 'src/data/cycling.json',
  });
}

runIfMain(import.meta.url, run);
