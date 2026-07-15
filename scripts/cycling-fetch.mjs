import { runETL } from './lib-etl.mjs';
import { transformStravaData } from './cycling-logic.mjs';
import { validateEnv } from './lib-credentials.mjs';
import { fetchOrThrow, runIfMain } from './lib-utils.mjs';

export async function fetchIntervalsData({ apiKey, athleteId }) {
  const now = new Date();
  // Fetch 15 months of history to ensure we have context for the start of the year
  // and plenty of buffer for previous month calculations
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - 15, now.getDate());

  // Format date as YYYY-MM-DD
  const oldestDate = cutoffDate.toISOString().split('T')[0];

  const auth = Buffer.from(`API_KEY:${apiKey}`).toString('base64');
  const url = `https://intervals.icu/api/v1/athlete/${athleteId}/activities?oldest=${oldestDate}`;

  console.log(`... Fetching activities from Intervals.icu starting from ${oldestDate}...`);
  const res = await fetchOrThrow(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const list = await res.json();

  // Map Intervals.icu activities to Strava schema expected by transformStravaData
  return list.map((act) => {
    const stravaId = act.strava_id ? parseInt(act.strava_id, 10) : null;
    const cleanId = String(act.id).replace('i', '');
    const url = stravaId
      ? `https://www.strava.com/activities/${stravaId}`
      : `https://intervals.icu/activities/${cleanId}`;

    return {
      id: stravaId || act.id,
      url,
      name: act.name,
      type: act.type,
      sport_type: act.type,
      distance: act.distance,
      total_elevation_gain: act.total_elevation_gain,
      start_date: act.start_date,
      trainer: act.trainer === true,
      visibility: 'everyone',
    };
  });
}

export async function run() {
  await runETL({
    name: 'Intervals (Cycling)',
    fetcher: async () => {
      const creds = validateEnv(
        {
          apiKey: 'INTERVALS_API_KEY',
          athleteId: 'INTERVALS_ATHLETE_ID',
        },
        'Intervals'
      );
      return fetchIntervalsData(creds);
    },
    transform: transformStravaData,
    outFile: 'src/data/cycling.json',
  });
}

runIfMain(import.meta.url, run);
