# Site Philosophy & Repo Preferences (`eddiewelker.com`)

## Voice, Purpose & Design Ethos
- **Human first, authentically understated:** This site is both a personal playspace (recipes, cycling, music, photos, media, experiments) and a professional presence for getting Eddie's name out / hiring. Leaning a bit more into professional experience is good, as long as it stays authentic and not loud/boastful.
- **Subtle header cues, deeper story on `/about/`:** LinkedIn and GitHub live subtly in the global header across all pages, with fuller work history on `/about/`.
- **Utility tools (`/gas/`):** Built genuinely for Eddie and local users; light discoverability improvements are fine when genuinely helpful, just low priority—avoid gimmicky SEO.
- **Content standards:** Recipes and posts stay `draft: true` until personally refined. Concrete, genuine write-ups (recipes, bike/gear posts, real migrations/projects) are the preferred direction.

## Engineering & Architecture Preferences
- **Keep the simple git-backed cache architecture** (`src/data/cache/` updated by `.github/workflows/rebuild.yml` as redundancy/fallback; live Cloudflare builds also run `npm run fetch` for fresh data).
- **Keep `npm test` gating `astro build`** in `npm run build` (runs in tandem with Cloudflare Workers Builds; `npm run test:smoke` runs locally and in GitHub Actions CI, and auto-skips when `WORKERS_CI=1` or `CF_PAGES=1`).
- **Analytics & Search Console:** Both `google-analytics` (GA4 property `392365637`) and `google-search-console` (`sc-domain:eddiewelker.com`) MCP servers are configured in `~/.gemini/config/mcp_config.json`. When pulling GA4 data, exclude `trafficheap.cc` ghost referral spam. `Analytics.astro` only loads GA4 on prod hostnames and supports `?notrack=1` / `?notrack=0` (`localStorage.ga_opt_out`) for excluding Eddie's own devices.

## Deployment, Secrets & External Trigger Topology
- **Production Worker (`eddiewelker-com`):** Astro 7 + `@astrojs/cloudflare` with Static Assets (`dist/client/` + `dist/server/entry.mjs`). Custom domains (`eddiewelker.com`, `www.eddiewelker.com`) are declared in `wrangler.jsonc`. Cloudflare Workers Builds auto-deploys branch `astro`.
- **Runtime Secrets vs. Build Variables (configured separately in Cloudflare):**
  - **Runtime Secrets** (managed via `npx wrangler secret put` or Worker Settings → Variables): `ORS_API_KEY` (used at request time by `src/pages/api/matrix.js` via `cloudflare:workers` `env`, calling `https://api.heigit.org/openrouteservice/v2/matrix/driving-car`).
  - **Build Variables** (managed in Dashboard → `eddiewelker-com` → Settings → Build → Variables and Secrets): `FLICKR_API_KEY`, `INTERVALS_API_KEY`, `INTERVALS_ATHLETE_ID`, `LASTFM_API_KEY`, `LASTFM_USERNAME`, `TMDB_API_KEY`, `PLEX_TOKEN` (used by `npm run fetch` at build time for fresh data).
- **External Rebuild Triggers (Other Cloudflare Workers):**
  - **Strava webhook Worker:** Fires when a ride finishes to trigger a fresh site rebuild (pulling updated Intervals.icu cycling data).
  - **`plex-ratings-poller` Worker:** Polls for new Plex ratings and triggers a fresh site rebuild.
  - **Important:** Both external Workers call this site's Cloudflare deploy hook—if hosting, project name, or deploy hooks ever change, update both Workers as well.
