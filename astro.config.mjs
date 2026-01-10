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
    inlineStylesheets: 'always',
  },
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
              entrypoint: './src/pages/_BlogPostItem.astro'
            });
            injectRoute({
              pattern: '/recipes/[slug]',
              entrypoint: './src/pages/_RecipeItem.astro'
            });
            injectRoute({
              pattern: '/tags/[tag]',
              entrypoint: './src/pages/_TagItem.astro'
            });
            injectRoute({
              pattern: '/media/[decade]',
              entrypoint: './src/pages/_MediaDecadeItem.astro'
            });
            injectRoute({
              pattern: '/gas/[region]',
              entrypoint: './src/pages/_GasRegionItem.astro'
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
  },
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
  trailingSlash: 'ignore',
});
