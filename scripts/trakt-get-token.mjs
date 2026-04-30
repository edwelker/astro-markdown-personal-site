#!/usr/bin/env node
/**
 * Obtain a fresh Trakt access token via the device-code (PIN) OAuth flow.
 *
 * Usage:
 *   TRAKT_CLIENT_ID=<your_id> TRAKT_CLIENT_SECRET=<your_secret> node scripts/trakt-get-token.mjs
 *
 * It will print a URL + code, wait for you to authorize in a browser, then print
 * the access token you should set as TRAKT_ACCESS_TOKEN in Cloudflare Pages.
 */

const { TRAKT_CLIENT_ID, TRAKT_CLIENT_SECRET } = process.env;

if (!TRAKT_CLIENT_ID || !TRAKT_CLIENT_SECRET) {
  console.error('❌  Set TRAKT_CLIENT_ID and TRAKT_CLIENT_SECRET before running this script.');
  process.exit(1);
}

const BASE = 'https://api.trakt.tv';
const HEADERS = { 'Content-Type': 'application/json', 'trakt-api-version': '2', 'trakt-api-key': TRAKT_CLIENT_ID };

// 1. Request a device code
const codeRes = await fetch(`${BASE}/oauth/device/code`, {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({ client_id: TRAKT_CLIENT_ID }),
});
if (!codeRes.ok) {
  console.error(`❌  Failed to get device code: ${codeRes.status} ${codeRes.statusText}`);
  process.exit(1);
}
const { device_code, user_code, verification_url, expires_in, interval } = await codeRes.json();

console.log('\n🔑  Trakt authorization required');
console.log(`\n   1. Open:  ${verification_url}`);
console.log(`   2. Enter: ${user_code}\n`);
console.log(`Waiting for authorization (expires in ${expires_in}s) …\n`);

// 2. Poll until authorized or expired
const pollInterval = (interval + 1) * 1000; // add 1s buffer
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
    continue; // still waiting for user
  }

  if (tokenRes.status === 410) {
    console.error('\n❌  Code expired. Re-run the script.');
    process.exit(1);
  }

  console.error(`\n❌  Unexpected response: ${tokenRes.status} ${tokenRes.statusText}`);
  process.exit(1);
}

if (!accessToken) {
  console.error('\n❌  Timed out waiting for authorization.');
  process.exit(1);
}

console.log('\n\n✅  Authorization successful!\n');
console.log('Set this as TRAKT_ACCESS_TOKEN in your Cloudflare Pages environment variables:\n');
console.log(accessToken);
console.log('\nNote: Trakt access tokens are valid for ~90 days.');
console.log('Re-run this script when the token expires.\n');
