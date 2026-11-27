---
title: "How This Site Actually Works (Three Workers, a Cache, and Some Duct Tape)"
date: 2026-11-27T13:25:00
draft: true
description: "A walkthrough of the architecture behind eddiewelker.com: Astro 7 on Cloudflare Workers, build-time ETL with a git-backed fallback cache, Strava and Plex webhook Workers, Discord alerts, and a Python gas-price scraper."
slug: "2026/11/27/how-this-site-is-built"
tags: ["Astro", "Cloudflare Workers", "Architecture", "Automation", "Python"]
---

Earlier this year I wrote about [moving this site from WordPress to Hugo to Astro](/blog/2026/01/06/wordpress-to-hugo-to-astro/). That post was mostly about escaping maintenance overhead and getting my content back into plain Markdown.

Since then, the site has quietly turned into a small distributed system—still free to run, still mostly static HTML, but wired into a handful of external APIs, webhooks, and scheduled jobs so it stays fresh without me touching it. Here is how the pieces actually fit together.

## The Core Site: Astro 7 on Cloudflare Workers

The main site (`eddiewelker-com`) runs on **Astro 7** deployed to **Cloudflare Workers with Static Assets** (`@astrojs/cloudflare`). Almost every page—blog posts, recipes, `/uses/`, `/media/`, `/music/`, `/gas/`—is prerendered to static HTML at build time (`dist/client/`) and served straight from Cloudflare's edge.

Two routes intentionally opt out of static prerendering and run on the Worker at request time:

1. **`/sports/` (Workers SSR):** Fetches live MLB and NBA scores, standings, and trade rumors in parallel from ESPN, MLB Trade Rumors, and Hoops Rumors. To keep it fast and avoid hammering upstream feeds, it sets `Cache-Control: public, max-age=900, s-maxage=900` so Cloudflare caches the rendered HTML at the edge for 15 minutes.
2. **`/api/matrix` (Serverless Proxy):** Powers the "Calculate Driving Times" button on `/gas/`. The browser sends station coordinates plus the user's location, and the Worker proxies the request to HeiGIT's OpenRouteService matrix API using a runtime secret (`ORS_API_KEY` via `cloudflare:workers`). It validates `Origin`/`Referer`, enforces coordinate bounds (`2–50` points), and whitelists fields so nobody can abuse my API key as an open proxy.

Custom domains (`eddiewelker.com` and `www.eddiewelker.com`) are declared right in `wrangler.jsonc`, with a single Cloudflare Redirect Rule sending `www.` to the apex domain via `301` while preserving query strings.

## Build-Time ETL (and Why There Is a Git-Backed Cache)

A personal site is more fun when it reflects what you're actually doing—recent bike rides, what you're listening to on Last.fm, recent Flickr photos, movies rated on Plex, and local gas prices.

Instead of fetching those APIs in the browser (slow, exposes keys, breaks when an API hiccups), `npm run fetch` runs a parallel set of Node ETL scripts at build time:

- **Cycling:** Intervals.icu API
- **Music:** Last.fm API
- **Photos:** Flickr API
- **Media:** Plex ratings enriched with TMDB metadata
- **Gas Prices:** CSV output from `find_cheap_local_gas`

Every Cloudflare Workers Build has the API keys configured as build variables, so every deploy pulls fresh data. Alongside that, a scheduled GitHub Actions workflow (`rebuild.yml`) periodically refreshes `src/data/cache/*.json` and commits changes back to the repo (skipping no-op diffs so git history stays clean). If an upstream API is ever down during a deploy, `npm run fetch` logs a warning and seamlessly falls back to the committed cache instead of failing the build.

## `find_cheap_local_gas`: The Python Sidecar

The `/gas/` pages track prices around the areas I actually drive—Columbia and Frederick in Maryland, Eastern Long Island, and Western Massachusetts.

That data comes from a separate repo, [find_cheap_local_gas](https://github.com/edwelker/find_cheap_local_gas), which runs Python scripts on a GitHub Actions schedule four times a day to extract, normalize, and publish clean CSVs. During this site's build, `scripts/gas-fetch.mjs` pulls those CSVs in parallel, sorts them deterministically, and bakes them into static HTML and JSON. In the browser, clicking "Calculate Driving Times" calls `/api/matrix` to overlay live drive times onto the table.

## The Two Event-Driven Workers (and Discord)

Waiting for a daily cron job is fine for most things, but when I finish a bike ride or rate a movie on Plex, I want it on the site right away. That's where the other two Cloudflare Workers come in:

1. **`strava-webhook-bridge`:** Receives Strava's webhook event when an activity finishes, posts a quick status message to my private Discord channel (`DISCORD_WEBHOOK_URL`), and fires the Cloudflare Workers Builds deploy hook for `eddiewelker-com`. About a minute later, the fresh build—with updated Intervals.icu cycling stats—is live.
2. **`plex-ratings-poller`:** Polls Plex on a schedule for newly rated movies or shows. When it spots a new rating, it notifies Discord and hits the exact same Workers Builds deploy hook.

Using Discord as a lightweight operational log for these small Workers has been surprisingly nice—I get an instant ping when a ride or rating triggers a rebuild without setting up a real monitoring stack.

## Images & Search Without Repo Bloat

I upload photos to Flickr because I like having one photo archive, and I didn't want gigabytes of JPEGs checked into git. With Astro 7's `image.domains` (`live.staticflickr.com`) and `<Image inferSize />`, I keep pasting Flickr URLs into frontmatter, and Astro downloads and compiles them into self-hosted WebP assets (with `width` and `height` baked in) at build time. The site gets fast local WebP images and zero Flickr hotlink fragility, while git stays tiny.

Site search runs entirely client-side via **Pagefind**, which indexes the static build output into compressed chunks in `dist/client/pagefind/`—no Algolia account, no backend server.

## Tests & Guardrails

Every build runs a tiered safety net:

- **Unit & schema tests (Vitest):** 59 test files covering ETL transforms, `/api/matrix` security rules, sports parsing, and content schemas.
- **Build-artifact integrity tests:** Verify the generated `dist/client/` HTML, RSS feed, sitemap, `robots.txt`, JSON-LD blocks, and Worker bundle.
- **Playwright browser smoke tests (`npm run test:smoke`):** Spin up the built output in headless Chromium, check representative routes for zero JS errors or broken assets, open the Pagefind modal to run a real search and close it on `Esc`, toggle dark/light mode, and verify analytics opt-out. These run automatically on local builds and in GitHub Actions CI, and auto-skip inside Cloudflare's build container (`WORKERS_CI=1`).

## What It Costs

Everything here—Cloudflare Workers & Static Assets, the two helper Workers, GitHub Actions, Pagefind, and the upstream free-tier APIs—runs for **$0/month** beyond the domain registration. It's probably slightly over-engineered for a personal blog, which is half the fun of having one.
