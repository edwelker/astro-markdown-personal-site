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
    indexNow({
      key: 'a65da6c13546cfc1ba9ce202a16754166c09d7e3f7ce142d60d41ed7d514326b',
    }),
    sitemap({
      filter: (page) => !page.includes('/dash'),
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

          // 3. Get Git Lastmod
          if (filePath && fs.existsSync(filePath)) {
            const gitDate = execSync(`git log -1 --format=%cI "${filePath}"`, {
              encoding: 'utf-8',
            }).trim();
            if (gitDate) {
              // console.log(`✅ [Sitemap] Found: ${url.pathname} -> ${path.basename(filePath)}`);
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
          disallow: ['/dash/', '/dashboard/'],
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
