#!/usr/bin/env node
/**
 * Automated topic, GSC, GA4, and draft-priority digest for eddiewelker.com.
 *
 * Usage:
 *   npm run ideas
 *   npm run ideas -- --from-drafts
 *   npm run ideas -- "astro 7 cloudflare" "surly ogre bikepacking"
 *   DISCORD_WEBHOOK_URL=... npm run ideas -- --discord
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

const rawArgs = process.argv.slice(2).filter((a) => a !== '--');
const hasFlag = (f) => rawArgs.includes(f);
const customTopics = rawArgs.filter((a) => !a.startsWith('-'));

if (hasFlag('--help') || hasFlag('-h')) {
  console.log(`
Usage:
  npm run ideas                                   Run default digest
  npm run ideas -- --from-drafts                  Use your draft posts/recipes as seed topics
  npm run ideas -- "topic 1" "topic 2"            Check custom seed topics
  npm run ideas -- --discord                      Also post summary to DISCORD_WEBHOOK_URL

What each section means:
  1. GSC (28d Momentum & Striking Distance):
     Queries gaining impressions right now + Page 2-5 queries Google ALREADY shows you for.
  2. GA4 (Top Engaged Pages, 30d):
     Pages that actually hold human readers' attention (trafficheap.cc spam excluded).
  3. Draft Priority (from src/content/):
     Your unpublished draft: true posts & recipes ranked by Google Autocomplete demand.
  4. Topic Signals (Autocomplete · Angles · Hacker News · GitHub Issues):
     Exact phrases people search, "vs / how to" angles, HN stories, and fresh GitHub pain points.
  5. Google Trends (5-Year Compare Link):
     One-click 5-year US trend chart to spot rising, seasonal, or fading topics.
`);
  process.exit(0);
}

const GSC_SITE = process.env.GSC_SITE_URL || 'sc-domain:eddiewelker.com';
const GA4_PROPERTY = process.env.GA4_PROPERTY_ID || '392365637';
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

async function getGoogleAccessToken() {
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
        scope: [
          'https://www.googleapis.com/auth/webmasters.readonly',
          'https://www.googleapis.com/auth/analytics.readonly',
        ].join(' '),
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
    return { token: tokenData.access_token };
  } catch (err) {
    return { error: err.message };
  }
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchGscMomentum(token) {
  try {
    const now = new Date();
    const d28 = new Date(now.getTime() - 28 * 86400_000);
    const d56 = new Date(now.getTime() - 56 * 86400_000);
    const d90 = new Date(now.getTime() - 90 * 86400_000);
    const gscUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const [recent28, prior28, last90] = await Promise.all([
      fetchJson(gscUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          startDate: fmtDate(d28),
          endDate: fmtDate(now),
          dimensions: ['query'],
          rowLimit: 50,
        }),
      }),
      fetchJson(gscUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          startDate: fmtDate(d56),
          endDate: fmtDate(d28),
          dimensions: ['query'],
          rowLimit: 50,
        }),
      }),
      fetchJson(gscUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          startDate: fmtDate(d90),
          endDate: fmtDate(now),
          dimensions: ['query', 'page'],
          rowLimit: 50,
        }),
      }),
    ]);

    const priorMap = new Map(
      (prior28.rows || []).map((r) => [r.keys[0], r.impressions])
    );
    const rising = (recent28.rows || [])
      .map((r) => {
        const prev = priorMap.get(r.keys[0]) || 0;
        return {
          query: r.keys[0],
          impressions: r.impressions,
          delta: r.impressions - prev,
          position: r.position,
        };
      })
      .filter((r) => r.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 6);

    const striking = (last90.rows || [])
      .map((r) => ({
        query: r.keys[0],
        page: r.keys[1].replace('https://eddiewelker.com', ''),
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
      }))
      .filter((r) => r.position >= 8 && r.position <= 50)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 8);

    return { rising, striking };
  } catch (err) {
    return { error: err.message };
  }
}

async function fetchGa4TopEngaged(token) {
  try {
    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY}:runReport`;
    const report = await fetchJson(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'userEngagementDuration' },
          { name: 'sessions' },
        ],
        dimensionFilter: {
          notExpression: {
            filter: {
              fieldName: 'sessionSource',
              stringFilter: { matchType: 'CONTAINS', value: 'trafficheap.cc' },
            },
          },
        },
        orderBys: [{ metric: { metricName: 'userEngagementDuration' }, desc: true }],
        limit: 8,
      }),
    });

    const rows = (report.rows || [])
      .map((r) => {
        const page = r.dimensionValues[0].value;
        const views = Number(r.metricValues[0].value || 0);
        const engSec = Number(r.metricValues[1].value || 0);
        const sessions = Number(r.metricValues[2].value || 0);
        return { page, views, engSec, avgSec: sessions > 0 ? engSec / sessions : 0 };
      })
      .filter((r) => r.engSec > 0 && !r.page.startsWith('/drafts'));

    return { rows };
  } catch (err) {
    return { error: err.message };
  }
}

function scanDrafts() {
  const drafts = [];
  const roots = [
    { dir: 'src/content/blog', type: 'blog' },
    { dir: 'src/content/recipes', type: 'recipe' },
  ];

  function walk(dir, type) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, type);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        const raw = fs.readFileSync(full, 'utf8');
        const fm = raw.match(/^---\n([\s\S]*?)\n---/);
        if (!fm) continue;
        if (!/^draft:\s*true\b/m.test(fm[1])) continue;
        const titleMatch = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
        if (!titleMatch) continue;
        const title = titleMatch[1];
        // Build a concise 3-4 word search seed from the title
        const seed = title
          .replace(/\([^)]*\)/g, '')
          .replace(/[^a-zA-Z0-9\s-]/g, ' ')
          .trim()
          .split(/\s+/)
          .slice(0, 4)
          .join(' ')
          .toLowerCase();
        drafts.push({ type, title, seed, file: full });
      }
    }
  }

  for (const r of roots) walk(r.dir, r.type);
  return drafts;
}

async function fetchAutocomplete(query, limit = 6) {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const data = await fetchJson(url);
    return Array.isArray(data?.[1]) ? data[1].slice(0, limit) : [];
  } catch {
    return [];
  }
}

async function fetchHackerNews(query) {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=3`;
    const data = await fetchJson(url);
    return (data.hits || []).map((h) => ({
      title: h.title,
      points: h.points ?? 0,
      comments: h.num_comments ?? 0,
    }));
  } catch {
    return [];
  }
}

async function fetchGitHubIssues(query) {
  // Only query GitHub for tech/dev-looking topics so we don't burn unauth rate limit on recipes
  if (!/(astro|cloudflare|worker|python|django|vim|git|node|css|playwright|linux|mac)/i.test(query)) {
    return [];
  }
  try {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query + ' is:issue')}&sort=reactions&order=desc&per_page=3`;
    const data = await fetchJson(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'eddiewelker-ideas-script',
      },
    });
    return (data.items || []).map((i) => ({
      title: i.title,
      repo: i.repository_url?.split('/').slice(-2).join('/') || '',
      reactions: i.reactions?.total_count ?? 0,
      comments: i.comments ?? 0,
    }));
  } catch {
    return [];
  }
}

console.log('🔎 Gathering GSC, GA4, draft, and search-demand signals...\n');

const drafts = scanDrafts();
const scoredDraftsPromise = Promise.all(
  drafts.slice(0, 12).map(async (d) => {
    const suggestions = await fetchAutocomplete(d.seed, 5);
    return { ...d, score: suggestions.length, suggestions };
  })
);

const topics = hasFlag('--from-drafts')
  ? drafts.slice(0, 5).map((d) => d.seed)
  : customTopics.length > 0
    ? customTopics
    : DEFAULT_TOPICS;

const auth = await getGoogleAccessToken();

const [gsc, ga4, scoredDrafts, topicResults] = await Promise.all([
  auth.token ? fetchGscMomentum(auth.token) : Promise.resolve(auth),
  auth.token ? fetchGa4TopEngaged(auth.token) : Promise.resolve(auth),
  scoredDraftsPromise,
  Promise.all(
    topics.map(async (query) => {
      const [base, vsAngles, howToAngles, hn, gh] = await Promise.all([
        fetchAutocomplete(query, 6),
        fetchAutocomplete(`${query} vs`, 3),
        fetchAutocomplete(`how to ${query}`, 3),
        fetchHackerNews(query),
        fetchGitHubIssues(query),
      ]);
      const angles = [...new Set([...vsAngles, ...howToAngles])].filter(
        (s) => !base.includes(s)
      );
      return { query, base, angles, hn, gh };
    })
  ),
]);

const lines = [];
const out = (line = '') => {
  lines.push(line);
  console.log(line);
};

out('=== 1. GOOGLE SEARCH CONSOLE (Momentum & Striking Distance) ===');
out('  How to read: Rising = gaining impressions vs prior 28d. Striking = Page 2-5 queries Google already shows you for.\n');
if (gsc.skipped) {
  out(`  Skipped: ${gsc.skipped}`);
} else if (gsc.error) {
  out(`  Error: ${gsc.error}`);
} else {
  if (gsc.rising.length > 0) {
    out('  Rising (Last 28d vs prior 28d):');
    for (const r of gsc.rising) {
      out(`    ↑ "${r.query}" — +${r.delta} impr (${r.impressions} total, pos ${r.position.toFixed(1)})`);
    }
  }
  if (gsc.striking.length > 0) {
    out('  Striking Distance (Last 90d, pos 8-50):');
    for (const r of gsc.striking) {
      const bucket = r.position <= 12 ? '[Page 1 edge]' : r.position <= 20 ? '[Page 2]' : '[Page 3+]';
      out(`    • ${bucket} "${r.query}" — ${r.impressions} impr, ${r.clicks} clicks, pos ${r.position.toFixed(1)} → ${r.page}`);
    }
  }
}

out('\n=== 2. GOOGLE ANALYTICS 4 (Top Engaged Pages, Last 30d) ===');
out('  How to read: Pages that hold real readers longest (trafficheap.cc spam excluded).\n');
if (ga4.skipped) {
  out(`  Skipped: ${ga4.skipped}`);
} else if (ga4.error) {
  out(`  Error: ${ga4.error}`);
} else if (ga4.rows.length === 0) {
  out('  No engaged page data yet.');
} else {
  for (const r of ga4.rows.slice(0, 6)) {
    out(`  • ${r.page} — ${r.engSec}s total (${r.avgSec.toFixed(1)}s/session, ${r.views} views)`);
  }
}

out('\n=== 3. DRAFT PRIORITY (Your Unpublished Posts & Recipes) ===');
out('  How to read: Drafts ranked by how many real Google Autocomplete queries match their topic.\n');
const rankedDrafts = scoredDrafts.sort((a, b) => b.score - a.score);
if (rankedDrafts.length === 0) {
  out('  No draft: true files found.');
} else {
  for (const d of rankedDrafts.slice(0, 6)) {
    const sample = d.suggestions.slice(0, 2).join(' | ') || 'niche / personal';
    out(`  • [${d.type}] ${d.title} (${d.score} matches: ${sample})`);
  }
}

out('\n=== 4. TOPIC SIGNALS (Autocomplete · Angles · Hacker News · GitHub) ===');
out('  How to read: Autocomplete/Angles = real phrases & comparisons people search. HN/GitHub = active dev pain points.');
for (const t of topicResults) {
  out(`\n## ${t.query}`);
  out(`  Google Autocomplete: ${t.base.join(' | ') || '(none)'}`);
  if (t.angles.length > 0) {
    out(`  Comparison / How-To: ${t.angles.join(' | ')}`);
  }
  if (t.hn.length > 0) {
    out('  Hacker News:');
    for (const h of t.hn) {
      out(`    - [${h.points} pts, ${h.comments} cmt] ${h.title}`);
    }
  }
  if (t.gh.length > 0) {
    out('  GitHub Issues (top reactions):');
    for (const i of t.gh) {
      out(`    - [${i.reactions}👍, ${i.comments} cmt] (${i.repo}) ${i.title}`);
    }
  }
}

const trendsTopics = topics.slice(0, 5);
const trendsUrl = `https://trends.google.com/trends/explore?date=today%205-y&geo=US&q=${trendsTopics
  .map((q) => encodeURIComponent(q))
  .join(',')}`;

out('\n=== 5. GOOGLE TRENDS (5-Year Trajectory & Seasonality) ===');
out('  How to read: Open to see whether interest is rising, steady, seasonal, or fading over 5 years.');
out(`  Compare (${trendsTopics.length} topics): ${trendsUrl}`);

out('\n=== TIP: CUSTOMIZE YOUR RUN ===');
out('  npm run ideas -- --from-drafts');
out('  npm run ideas -- "astro 7 cloudflare" "surly ogre bikepacking"');
out('  DISCORD_WEBHOOK_URL=... npm run ideas -- --discord');
out('  npm run ideas -- --help\n');

if (hasFlag('--discord')) {
  const hook = process.env.DISCORD_WEBHOOK_URL;
  if (!hook) {
    console.error('⚠️  --discord passed, but DISCORD_WEBHOOK_URL is not set.');
  } else {
    const digest = lines.join('\n').slice(0, 1900);
    await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `\`\`\`\n${digest}\n\`\`\`` }),
    });
    console.log('📨 Posted digest to Discord.');
  }
}

process.exit(0);
