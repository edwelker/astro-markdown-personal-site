import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import robotsTxt from 'astro-robots-txt';
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://eddiewelker.com",
  output: "static",
  adapter: cloudflare({
    imageService: "compile",
  }),
  build: {
    // Force Astro to link stylesheets as external files
    inlineStylesheets: 'never',
  },
  redirects: {
    '/dashboard': '/dash/',
  },
  integrations: [
      {
        name: 'custom-routes',
        hooks: {
          'astro:config:setup': ({ injectRoute }) => {
            injectRoute({
              pattern: '/blog/[...slug]',
              entrypoint: './src/components/pages/BlogList.page.astro'
            });
            injectRoute({
              pattern: '/gas/[region]',
              entrypoint: './src/components/pages/GasRegionList.page.astro'
            });
            injectRoute({
              pattern: '/tags/[tag]',
              entrypoint: './src/components/pages/TagList.page.astro'
            });
            injectRoute({
              pattern: '/recipes/[...slug]',
              entrypoint: './src/components/pages/RecipeList.page.astro'
            });
            injectRoute({
              pattern: '/media/[decade]',
              entrypoint: './src/components/pages/MediaDecadeList.page.astro'
            });
          }
        }
      },
      sitemap({
          filter : (page) => !page.includes("/dash")
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
    resolve: process.argv.includes("build") ? {
      alias: {
        "node:path/posix": "path-browserify",
      },
    } : undefined,
    build: {
      // Prevent Vite from inlining assets (including CSS) as base64
      assetsInlineLimit: 0,
      // Ensure CSS is split into separate files
      cssCodeSplit: true,
    },
  },
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
  trailingSlash: 'ignore',
});
