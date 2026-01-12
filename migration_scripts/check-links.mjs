import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, '../src/content/blog');
const IGNORE_FILE = path.resolve(__dirname, 'link-check-ignore.json');

// Fake a real browser to avoid 403s from sites like IMDb/NYT
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getFiles(dir) {
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
      })
    );
    return files.flat();
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error(`Directory not found: ${dir}`);
      return [];
    }
    throw e;
  }
}

async function loadIgnoreList() {
  try {
    const content = await fs.readFile(IGNORE_FILE, 'utf-8');
    return new Set(JSON.parse(content));
  } catch (e) {
    return new Set();
  }
}

async function checkLinks() {
  try {
    console.log(`Scanning ${BLOG_DIR}...`);
    const files = await getFiles(BLOG_DIR);
    const mdFiles = files.filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
    const ignoreList = await loadIgnoreList();

    if (mdFiles.length === 0) {
      console.log('No blog posts found.');
      return;
    }

    console.log(`Found ${mdFiles.length} blog posts.`);

    const links = new Set();
    const linkMap = new Map(); // URL -> [files]

    // Regex to catch http/https links.
    // Exclude common trailing punctuation and markdown characters: ) ] " '
    const urlRegex = /https?:\/\/[^\s\)"'\]]+/g;

    for (const file of mdFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const matches = content.match(urlRegex);
      if (matches) {
        matches.forEach((url) => {
          // Clean up common trailing characters from regex over-matching
          let cleanUrl = url.replace(/[\)\]"';\.,]*$/, '');

          // Skip localhost links
          if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) return;

          // Skip ignored links
          if (ignoreList.has(cleanUrl)) return;

          links.add(cleanUrl);
          if (!linkMap.has(cleanUrl)) linkMap.set(cleanUrl, []);
          linkMap.get(cleanUrl).push(path.basename(file));
        });
      }
    }

    console.log(`Found ${links.size} unique external links to check.`);

    const results = [];
    const allLinks = Array.from(links);
    const CHUNK_SIZE = 50;

    for (let i = 0; i < allLinks.length; i += CHUNK_SIZE) {
      const chunk = allLinks.slice(i, i + CHUNK_SIZE);
      const promises = chunk.map(async (url) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          // Try HEAD first
          let res = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: { 'User-Agent': USER_AGENT },
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            // Retry with GET if HEAD fails (some servers block HEAD or return 403/405)
            const controller2 = new AbortController();
            const timeoutId2 = setTimeout(() => controller2.abort(), 10000);
            const resGet = await fetch(url, {
              method: 'GET',
              signal: controller2.signal,
              headers: { 'User-Agent': USER_AGENT },
            });
            clearTimeout(timeoutId2);

            return { url, status: resGet.status, ok: resGet.ok, error: resGet.statusText };
          }
          return { url, status: res.status, ok: true };
        } catch (e) {
          return { url, status: 0, ok: false, error: e.message };
        }
      });

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);

      // Progress indicator
      process.stdout.write(
        `\rChecked ${Math.min(i + CHUNK_SIZE, allLinks.length)}/${allLinks.length} links...`
      );
    }

    process.stdout.write('\n');

    const broken = results.filter((r) => !r.ok);

    if (broken.length === 0) {
      console.log('✅ All links are working!');
      return;
    }

    // Group by Status Code
    const byStatus = broken.reduce((acc, curr) => {
      const key = curr.status === 0 ? 'Connection Error' : curr.status.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    console.log('\n--- 📊 Summary by Status Code ---');
    Object.keys(byStatus)
      .sort()
      .forEach((status) => {
        console.log(`${status}: ${byStatus[status].length} links`);
      });

    // Group by Domain
    const byDomain = broken.reduce((acc, curr) => {
      try {
        const domain = new URL(curr.url).hostname;
        if (!acc[domain]) acc[domain] = [];
        acc[domain].push(curr);
      } catch (e) {
        if (!acc['Invalid URL']) acc['Invalid URL'] = [];
        acc['Invalid URL'].push(curr);
      }
      return acc;
    }, {});

    console.log('\n--- 🌐 Top Broken Domains ---');
    Object.entries(byDomain)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10) // Top 10
      .forEach(([domain, items]) => {
        console.log(`${domain}: ${items.length} broken links`);
      });

    console.log('\n--- ❌ Detailed Errors ---');
    broken.forEach((r) => {
      const files = linkMap.get(r.url);
      const fileList =
        files.slice(0, 3).join(', ') + (files.length > 3 ? ` (+${files.length - 3} more)` : '');
      const statusLabel = r.status === 0 ? r.error : r.status;
      console.log(`[${statusLabel}] ${r.url}`);
      console.log(`   └─ Found in: ${fileList}`);
    });

    console.log(`\nTotal broken links: ${broken.length}`);
    console.log(`To ignore specific links, add them to: scripts/link-check-ignore.json`);

    process.exit(1);
  } catch (err) {
    console.error('Error checking links:', err);
    process.exit(1);
  }
}

checkLinks();
