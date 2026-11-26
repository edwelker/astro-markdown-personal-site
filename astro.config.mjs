import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import tailwindcss from '@tailwindcss/vite';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import cloudflare from '@astrojs/cloudflare';
import indexNow from 'astro-indexnow';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path'; // This fixes the 'path is not defined' error

const isBuild = process.argv.includes('build');
const isProdDeploy = process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH === 'astro';

let gitLastModCache = null;
function getGitLastModMap() {
  if (gitLastModCache) return gitLastModCache;
  gitLastModCache = new Map();
  try {
    const out = execSync('git log --format="COMMIT:%cI" --name-only', {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
    });
    let currentDate = '';
    for (const line of out.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('COMMIT:')) {
        currentDate = trimmed.slice(7);
      } else if (currentDate && !gitLastModCache.has(trimmed)) {
        gitLastModCache.set(trimmed, currentDate);
      }
    }
  } catch (e) {
    console.warn(`⚠️ [Sitemap] Failed to build git lastmod cache: ${e.message}`);
  }
  return gitLastModCache;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://eddiewelker.com',
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  redirects: {
    '/dashboard': '/dash/',
  },
  integrations: [
    {
      name: 'route-injector',
      hooks: {
        'astro:config:setup': ({ injectRoute }) => {
          injectRoute({
            pattern: '/blog/[...slug]',
            entrypoint: './src/templates/BlogPostItem.astro',
          });
          injectRoute({
            pattern: '/recipes/[slug]',
            entrypoint: './src/templates/RecipeItem.astro',
          });
          injectRoute({
            pattern: '/media/[decade]',
            entrypoint: './src/templates/MediaDecadeItem.astro',
          });
          injectRoute({
            pattern: '/gas/[region]',
            entrypoint: './src/templates/GasRegionItem.astro',
          });
        },
      },
    },
    ...(isProdDeploy
      ? [
          indexNow({
            key: 'a65da6c13546cfc1ba9ce202a16754166c09d7e3f7ce142d60d41ed7d514326b',
          }),
        ]
      : []),
    sitemap({
      filter: (page) => !page.includes('/dash') && !page.includes('/drafts'),
      serialize(item) {
        try {
          const url = new URL(item.url);
          const segments = url.pathname.split('/').filter(Boolean);
          // Grab the last segment as the slug (e.g., 'firefox-for-mac-...')
          const slug = segments[segments.length - 1];
          let filePath = '';

          // 1. Handle Content Collections (Blog/Recipes)
          if (
            (url.pathname.startsWith('/blog/') || url.pathname.startsWith('/recipes/')) &&
            segments.length > 1
          ) {
            const collection = url.pathname.startsWith('/blog/') ? 'blog' : 'recipes';
            const nested = path.resolve(`src/content/${collection}/${slug}/${slug}.md`);
            const flat = path.resolve(`src/content/${collection}/${slug}.md`);
            filePath = fs.existsSync(nested) ? nested : fs.existsSync(flat) ? flat : '';

            // Exclude drafts from sitemap
            if (filePath && fs.existsSync(filePath)) {
              const fileContent = fs.readFileSync(filePath, 'utf-8');
              if (/^draft:\s*true/m.test(fileContent)) {
                return undefined;
              }
            }
          }
          // 2. Handle Static Pages
          else {
            const base = url.pathname === '/' ? 'index' : url.pathname.replace(/\/$/, '');
            const searchPaths = [
              path.resolve(`src/pages${base}.astro`),
              path.resolve(`src/pages${base}/index.astro`),
              path.resolve(`src/pages${base}.md`),
              path.resolve(`src/pages${base}/index.md`),
            ];
            filePath = searchPaths.find((p) => fs.existsSync(p)) || '';
          }

          // 3. Get Git Lastmod (from single cached git log pass)
          if (filePath && fs.existsSync(filePath)) {
            const relPath = path.relative(process.cwd(), filePath).split(path.sep).join('/');
            const gitDate = getGitLastModMap().get(relPath);
            if (gitDate) {
              item.lastmod = gitDate;
              return item;
            }
          } else {
            // Fallback for tags/media/etc that don't have direct 1:1 physical files
            item.lastmod = new Date().toISOString();
          }
        } catch (e) {
          console.error(`❌ [Sitemap] Failed for ${item.url}: ${e.message}`);
          item.lastmod = new Date().toISOString();
        }
        return item;
      },
    }),
    mdx(),
    pagefind(),
    partytown({
      // This is necessary to tell Partytown to handle GA events
      forward: ['dataLayer.push'],
    }),
    robotsTxt({
      sitemapBaseFileName: 'sitemap-index', // Matches default astro-sitemap name
      policy: [
        {
          userAgent: '*',
          allow: '/',
          // Optional: Block things you don't want indexed
          disallow: ['/dash/', '/dashboard/', '/drafts/', '/~partytown/', '/data/'],
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: isBuild
        ? {
            'node:path/posix': 'path-browserify',
            path: 'path-browserify',
          }
        : {},
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
  },
  trailingSlash: 'ignore',
});
