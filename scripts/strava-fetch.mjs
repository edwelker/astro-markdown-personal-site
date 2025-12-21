import fs from 'node:fs/promises';
import { transformStravaData } from './strava-logic.mjs';

async function getAccessToken() {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID, client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN, grant_type: 'refresh_token'
    })
  });
  const data = await res.json();
  return data.access_token;
}

async function run() {
  try {
    const existing = JSON.parse(await fs.readFile('src/data/cycling.json', 'utf-8').catch(() => '{}'));
    const lastId = existing.recent?.[0]?.id;
    const token = await getAccessToken();
    let newItems = [], page = 1, found = false;

    while (page <= 5 && !found) {
      const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      if (!res.ok || !list.length) break;
      for (const a of list) {
        if (a.id === lastId) { found = true; break; }
        newItems.push(a);
      }
      page++;
    }

    if (newItems.length === 0 && lastId) return console.log('⏩ Strava: Up to date.');
    const fullSet = [...newItems, ...(existing._raw || [])];
    const clean = transformStravaData(fullSet);
    await fs.writeFile('src/data/cycling.json', JSON.stringify(clean, null, 2));
    console.log(`✅ Strava: Added ${newItems.length} rides.`);
  } catch (e) { console.error('❌ Strava Failed'); }
}
run();
