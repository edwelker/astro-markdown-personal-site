# Site Philosophy & Repo Preferences (`eddiewelker.com`)

## Voice, Purpose & Design Ethos
- **Human first, authentically understated:** This site is both a personal playspace (recipes, cycling, music, photos, media, experiments) and a professional presence for getting Eddie's name out / hiring. Leaning a bit more into professional experience is good, as long as it stays authentic and not loud/boastful.
- **Subtle header cues, deeper story on `/about/`:** LinkedIn and GitHub live subtly in the global header across all pages, with fuller work history on `/about/`.
- **Utility tools (`/gas/`):** Built genuinely for Eddie and local users; light discoverability improvements are fine when genuinely helpful, just low priority—avoid gimmicky SEO.
- **Content standards:** Recipes and posts stay `draft: true` until personally refined. Concrete, genuine write-ups (recipes, bike/gear posts, real migrations/projects) are the preferred direction.

## Engineering & Architecture Preferences
- **Keep the simple git-backed cache architecture** (`src/data/cache/` updated by `.github/workflows/rebuild.yml`).
- **Keep `npm test` gating `astro build`** in `npm run build` (runs in tandem with Cloudflare Pages deploys).
- **Analytics & Search Console:** Both `google-analytics` (GA4 property `392365637`) and `google-search-console` (`sc-domain:eddiewelker.com`) MCP servers are configured in `~/.gemini/config/mcp_config.json`. When pulling GA4 data, exclude `trafficheap.cc` ghost referral spam.
