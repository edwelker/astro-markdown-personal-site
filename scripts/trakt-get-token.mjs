#!/usr/bin/env node

const { TRAKT_CLIENT_ID, TRAKT_CLIENT_SECRET } = process.env;

if (!TRAKT_CLIENT_ID || !TRAKT_CLIENT_SECRET) {
  console.error('❌ Set TRAKT_CLIENT_ID and TRAKT_CLIENT_SECRET before running this script.');
  process.exit(1);
}

const BASE = 'https://api.trakt.tv';
const HEADERS = {
  'Content-Type': 'application/json',
  'trakt-api-version': '2',
  'trakt-api-key': TRAKT_CLIENT_ID,
  'User-Agent': 'TraktTokenGenerator/1.0 (Node.js)'
};

const codeRes = await fetch(`${BASE}/oauth/device/code`, {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({ client_id: TRAKT_CLIENT_ID }),
});

if (!codeRes.ok) {
  const errorText = await codeRes.text();
  console.error(`❌ Failed to get device code: ${codeRes.status} ${codeRes.statusText}`);
  console.error(`Response body: ${errorText}`);
  process.exit(1);
}

const { device_code, user_code, verification_url, expires_in, interval } = await codeRes.json();

console.log('\n🔑 Trakt authorization required');
console.log(`\n   1. Open:  ${verification_url}`);
console.log(`   2. Enter: ${user_code}\n`);
console.log(`Waiting for authorization (expires in ${expires_in}s) …\n`);

const pollInterval = (interval + 1) * 1000;
const deadline = Date.now() + expires_in * 1000;

let accessToken = null;
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, pollInterval));

  const tokenRes = await fetch(`${BASE}/oauth/device/token`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      code: device_code,
      client_id: TRAKT_CLIENT_ID,
      client_secret: TRAKT_CLIENT_SECRET,
    }),
  });

  if (tokenRes.status === 200) {
    const data = await tokenRes.json();
    accessToken = data.access_token;
    break;
  }

  if (tokenRes.status === 400) {
    process.stdout.write('.');
    continue;
  }

  if (tokenRes.status === 410) {
    console.error('\n❌ Code expired. Re-run the script.');
    process.exit(1);
  }

  const errBody = await tokenRes.text();
  console.error(`\n❌ Unexpected response: ${tokenRes.status} ${tokenRes.statusText}`);
  console.error(`Details: ${errBody}`);
  process.exit(1);
}

if (!accessToken) {
  console.error('\n❌ Timed out waiting for authorization.');
  process.exit(1);
}

console.log('\n\n✅ Authorization successful!\n');
console.log('Set this as TRAKT_ACCESS_TOKEN in your environment variables:\n');
console.log(accessToken);
console.log('\nNote: Trakt access tokens are valid for ~90 days.');