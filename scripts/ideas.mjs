#!/usr/bin/env node
/**
 * Automated topic & interest discovery digest for eddiewelker.com.
 *
 * Usage:
 *   npm run ideas
 *   npm run ideas -- "astro 7 cloudflare" "all-city mr pink" "sourdough boule"
 *
 * Sources (all public/official JSON APIs, zero extra dependencies):
 *   1. Google Search Console (striking-distance queries, positions 8-50) via local SA JSON if present
 *   2. Google Autocomplete (real search suggestions for seed topics)
 *   3. Hacker News Algolia API (recent high-engagement dev stories)
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const DEFAULT_TOPICS = [
  'astro cloudflare workers',
  'all-city mr pink',
  'fresh milled flour bread',
  'induction wok cooktop',
];

const cliArgs = process.argv.slice(2).filter((a) => a !== '--');
const topics = cliArgs.length > 0 ? cliArgs : DEFAULT_TOPICS;

const GSC_SITE = process.env.GSC_SITE_URL || 'sc-domain:eddiewelker.com';
const SA_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(os.homedir(), '.config', 'google', 'site-analytics-sa.json');

async function fetchJson(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function fetchGscOpportunities() {
  if (!fs.existsSync(SA_PATH)) {
    return { skipped: `No service account JSON at ${SA_PATH}` };
  }
  try {
    const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
    const now = Math.floor(Date.now() / 1000);
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claim = base64url(
      JSON.stringify({
        iss: sa.client_email,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
      })
    );
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(`${header}.${claim}`);
    const signature = signer
      .sign(sa.private_key, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const tokenData = await fetchJson('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${header}.${claim}.${signature}`,
      }),
    });

    const end = new Date();
    const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().slice(0, 10);

    const gscUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`;
    const report = await fetchJson(gscUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: fmt(start),
        endDate: fmt(end),
        dimensions: ['query', 'page'],
        rowLimit: 50,
      }),
    });

    const rows = (report.rows || [])
      .map((r) => ({
        query: r.keys[0],
        page: r.keys[1].replace('https://eddiewelker.com', ''),
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
      }))
      .sort((a, b) => b.impressions - a.impressions);

    return { rows };
  } catch (err) {
    return { error: err.message };
  }
}

async function fetchAutocomplete(query) {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const data = await fetchJson(url);
    return Array.isArray(data?.[1]) ? data[1].slice(0, 6) : [];
  } catch (err) {
    return [`(error: ${err.message})`];
  }
}

async function fetchHackerNews(query) {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=4`;
    const data = await fetchJson(url);
    return (data.hits || []).map((h) => ({
      title: h.title,
      points: h.points ?? 0,
      comments: h.num_comments ?? 0,
      url: `https://news.ycombinator.com/item?id=${h.objectID}`,
    }));
  } catch (err) {
    return [{ title: `(error: ${err.message})`, points: 0, comments: 0, url: '' }];
  }
}

console.log('🔎 Gathering topic & interest signals...\n');

const [gsc, topicResults] = await Promise.all([
  fetchGscOpportunities(),
  Promise.all(
    topics.map(async (query) => {
      const [suggestions, hn] = await Promise.all([
        fetchAutocomplete(query),
        fetchHackerNews(query),
      ]);
      return { query, suggestions, hn };
    })
  ),
]);

console.log('=== 1. GOOGLE SEARCH CONSOLE (Last 90 Days — Striking Distance) ===');
if (gsc.skipped) {
  console.log(`  Skipped: ${gsc.skipped}`);
} else if (gsc.error) {
  console.log(`  Error: ${gsc.error}`);
} else if (gsc.rows.length === 0) {
  console.log('  No rows returned.');
} else {
  const striking = gsc.rows.filter((r) => r.position >= 8 && r.position <= 50).slice(0, 10);
  const top = (striking.length > 0 ? striking : gsc.rows).slice(0, 10);
  for (const r of top) {
    console.log(
      `  • "${r.query}" — ${r.impressions} impr, ${r.clicks} clicks, pos ${r.position.toFixed(1)} (${r.page})`
    );
  }
}

console.log('\n=== 2. TOPIC SIGNALS (Google Autocomplete · Hacker News) ===');
for (const t of topicResults) {
  console.log(`\n## ${t.query}`);
  console.log(`  Google Autocomplete: ${t.suggestions.join(' | ') || '(none)'}`);
  if (t.hn.length > 0) {
    console.log('  Hacker News:');
    for (const h of t.hn) {
      console.log(`    - [${h.points} pts, ${h.comments} cmt] ${h.title}`);
    }
  }
}
console.log('');
process.exit(0);
