# Website: Astro version

This is the repository for my personal site, eddiewelker.com.

### History

1.  **WordPress (The Origin):** What I could do at the time, the exported from WP
2.  **Hugo (The Static Phase):** Templating was terrible because each had their own individual config format, so I couldn't switch templates easily.
3.  **Astro (The Final Form):** This current version is built on Astro. Standardized markdown schema and configuration.

***

## Info for me

### 1. How to Run & Build

| Command | Action | What to Remember |
| :--- | :--- | :--- |
| `npm install` | First-time setup | Must be run after cloning or pulling major dependencies. |
| `npm run dev` | Local Server | Runs locally at `http://localhost:4321`. Uses hot reloading (HMR) for most changes. |
| `npm run build` | Final Build | Generates the static output files in the `dist/` directory. **You must run this before deploying.** |

### 2. Content & Data (Where Everything Lives)

| Location | Purpose | Critical Reminders |
| :--- | :--- | :--- |
| `src/content/blog/` | Blog Posts | **Frontmatter is strictly validated.** Must match the schema in `src/content/config.ts`. If you get a `TypeError`, check your dates or boolean values (`draft: true`, NOT `draft: "true"`). |
| `src/content.config.ts` | Schema | This file defines what fields are allowed in your blog and project frontmatter. If you need a new field (like `highlight`), **you must update this file first.** |
| `src/data/highlights.ts` | Project Data | This is a static TypeScript array of your key projects and external links. **The field for your personal commentary is named `thought`** (an optional string). |
| `src/lib/highlights.ts` | Data Bridge | This simple helper file exports the function `getAllHighlights()`. Do not touch it unless the data source moves. |

### 3. Styling & Customization

I'm picky about this stuff. Make the web work like it should.

| Item | What to Remember |
| :--- | :--- |
| **Primary Font** | **Inter** is the primary font. It is self-hosted via `@fontsource/inter`. If the font ever breaks, check **`src/components/Head.astro`** to ensure the CSS import is present. |
| **Tailwind Config** | **`tailwind.config.mjs`** is where Tailwind's utility classes are mapped to Inter (`fontFamily.sans`). |
| **Link Styles** | All links in the main content are **underlined by default**. Visited links are styled with a **purple color** to indicate they've been clicked (this is the most visual change allowed by modern browsers). This logic is located in **`src/styles/global.css`** under the `main a:visited` selector. |

### 4. Special Astro Details

| Feature | Your Customization | Remember This |
| :--- | :--- | :--- |
| **Markdown Rendering** | You are using the default Markdown setup. | If you need custom components *inside* Markdown files, you need to convert that file to MDX (rename it to `.mdx`). |
| **Component Logic** | Logic is contained within the component's frontmatter (`---` block) for server-side execution. | If a component is behaving strangely, remember its JavaScript runs *only* on the server at build time unless you add a `client:` directive (and you shouldn't need one). |