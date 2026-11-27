#!/usr/bin/env node
/**
 * Browser & feature smoke tests.
 *
 * - Automatically skipped in Cloudflare build environments (WORKERS_CI / CF_PAGES).
 * - By default serves `dist/client/` locally on a random ephemeral port.
 * - Pass `SMOKE_BASE_URL=https://...` to run against a live Worker deployment
 *   (also verifies Workers SSR `/sports/` and `/api/matrix`).
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

if (process.env.WORKERS_CI === '1' || process.env.CF_PAGES === '1') {
  console.log('⏭️  Skipping browser smoke tests in Cloudflare build environment.');
  process.exit(0);
}

const LIVE_URL = process.env.SMOKE_BASE_URL?.replace(/\/$/, '') || '';
const DIST_DIR = path.resolve(
  fs.existsSync(path.resolve('dist/client')) ? 'dist/client' : 'dist'
);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.wasm': 'application/wasm',
};

function startStaticServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.join(rootDir, urlPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      }
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    return await chromium.launch({ headless: true, channel: 'chrome' });
  }
}

const ROUTES_TO_CHECK = [
  '/',
  '/about/',
  '/uses/',
  '/blog/',
  '/blog/2026/01/06/wordpress-to-hugo-to-astro/',
  '/recipes/',
  '/recipes/instant_pot_chili/',
  '/gas/columbia_md/',
  '/music/',
  '/media/',
];

let server;
let browser;
let passed = 0;

function pass(name) {
  passed++;
  console.log(`  ✓ ${name}`);
}

try {
  let baseUrl = LIVE_URL;
  if (!baseUrl) {
    assert(fs.existsSync(path.join(DIST_DIR, 'index.html')), `Build output missing at ${DIST_DIR}`);
    const started = await startStaticServer(DIST_DIR);
    server = started.server;
    baseUrl = started.baseUrl;
  }

  console.log(`🧪 Running browser smoke tests against ${baseUrl}...`);
  browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Keep smoke tests deterministic & don't ping external analytics/CDNs in local mode
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(baseUrl) || url.startsWith('data:') || url.startsWith('blob:')) {
      return route.continue();
    }
    return route.abort();
  });

  // 1. Core page types: 200 OK, zero JS errors, zero failed first-party assets, no broken Giscus iframe
  for (const routePath of ROUTES_TO_CHECK) {
    const pageErrors = [];
    const failedAssets = [];
    const onError = (err) => pageErrors.push(err.message);
    const onRes = (res) => {
      if (res.url().startsWith(baseUrl) && res.status() >= 400) {
        failedAssets.push(`${res.status()} ${res.url().slice(baseUrl.length)}`);
      }
    };
    page.on('pageerror', onError);
    page.on('response', onRes);

    const res = await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle' });
    assert.equal(res?.status(), 200, `${routePath} returned ${res?.status()}`);
    await page.waitForTimeout(200);

    page.off('pageerror', onError);
    page.off('response', onRes);

    assert.deepEqual(pageErrors, [], `JS errors on ${routePath}: ${pageErrors.join('; ')}`);
    assert.deepEqual(failedAssets, [], `Failed assets on ${routePath}: ${failedAssets.join('; ')}`);

    const giscusCount = await page.locator('iframe.giscus-frame, .giscus').count();
    assert.equal(giscusCount, 0, `Unexpected Giscus embed on ${routePath}`);
  }
  pass(`All ${ROUTES_TO_CHECK.length} representative routes load cleanly (200, 0 JS errors, 0 broken assets)`);

  // 2. Pagefind modal: hidden on load (no bleed-through), opens, searches, closes on Esc
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const backdrop = page.locator('#backdrop');
  const searchInput = page.locator('#search input').first();
  assert.equal(await backdrop.isVisible(), false, 'Search backdrop must be hidden on initial load');
  assert.equal(await searchInput.isVisible(), false, 'Search input must not bleed through on initial load');

  await page.locator('#magnifying-glass').click();
  await backdrop.waitFor({ state: 'visible', timeout: 3000 });
  await searchInput.waitFor({ state: 'visible', timeout: 3000 });
  await searchInput.fill('astro');
  await page.locator('#search a[href]').first().waitFor({ state: 'visible', timeout: 10000 });
  const resultLinks = await page.locator('#search a[href]').count();
  assert(resultLinks > 0, 'Pagefind search for "astro" should return at least one result');

  await page.keyboard.press('Escape');
  await backdrop.waitFor({ state: 'hidden', timeout: 3000 });
  assert.equal(await searchInput.isVisible(), false, 'Search input must hide after Escape');
  pass('Pagefind modal hidden on load, opens, returns results, and closes on Esc');

  // 3. System color-scheme preference toggles .dark on <html>
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  assert.equal(
    await page.evaluate(() => document.documentElement.classList.contains('dark')),
    true,
    'prefers-color-scheme: dark should apply .dark to <html>'
  );
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  assert.equal(
    await page.evaluate(() => document.documentElement.classList.contains('dark')),
    false,
    'prefers-color-scheme: light should remove .dark from <html>'
  );
  pass('System color-scheme preference toggles dark/light mode');

  // 4. Copy-code buttons on blog posts with code blocks
  await page.goto(`${baseUrl}/blog/2026/01/06/wordpress-to-hugo-to-astro/`, {
    waitUntil: 'networkidle',
  });
  const preCount = await page.locator('pre').count();
  if (preCount > 0) {
    const copyBtnCount = await page.locator('.copy-code').count();
    assert.equal(copyBtnCount, preCount, 'Every <pre> block should have a .copy-code button');
  }
  pass(`Copy-code buttons verified (${preCount} code blocks)`);

  // 5. GA4 non-prod guard & ?notrack=1 / ?notrack=0 opt-out
  await page.goto(`${baseUrl}/?notrack=1`, { waitUntil: 'networkidle' });
  assert.equal(
    await page.evaluate(() => localStorage.getItem('ga_opt_out')),
    '1',
    '?notrack=1 should set localStorage.ga_opt_out = "1"'
  );
  assert.equal(
    await page.locator('script[src*="googletagmanager.com"]').count(),
    0,
    'GA4 script must not load on non-prod hostnames or when opted out'
  );
  await page.goto(`${baseUrl}/?notrack=0`, { waitUntil: 'networkidle' });
  assert.equal(
    await page.evaluate(() => localStorage.getItem('ga_opt_out')),
    null,
    '?notrack=0 should clear localStorage.ga_opt_out'
  );
  pass('GA4 non-prod guard and ?notrack=1 / ?notrack=0 opt-out verified');

  // 6. Live Worker endpoint checks (only when SMOKE_BASE_URL is provided)
  if (LIVE_URL) {
    const sportsRes = await fetch(`${LIVE_URL}/sports/`);
    assert.equal(sportsRes.status, 200, `/sports/ returned ${sportsRes.status}`);
    pass('Live Workers SSR /sports/ returned 200');

    const unauthRes = await fetch(`${LIVE_URL}/api/matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: [
          [-86.1581, 39.7684],
          [-86.148, 39.778],
        ],
      }),
    });
    assert.equal(unauthRes.status, 403, `Unauthenticated /api/matrix returned ${unauthRes.status}`);

    const matrixRes = await fetch(`${LIVE_URL}/api/matrix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: LIVE_URL,
      },
      body: JSON.stringify({
        locations: [
          [-86.1581, 39.7684],
          [-86.148, 39.778],
        ],
        metrics: ['distance', 'duration'],
      }),
    });
    assert.equal(matrixRes.status, 200, `Live /api/matrix returned ${matrixRes.status}`);
    const matrixData = await matrixRes.json();
    assert(Array.isArray(matrixData.distances), 'Matrix response missing distances');
    assert(Array.isArray(matrixData.durations), 'Matrix response missing durations');
    pass('Live /api/matrix enforces Origin (403) and returns valid ORS route matrix (200)');
  }

  console.log(`\n✅ Smoke tests passed (${passed} checks).`);
} finally {
  if (browser) await browser.close();
  if (server) server.close();
}
