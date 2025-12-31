const fs = require('fs');
const path = require('path');

// 1. THE MASTER MERGE MAP
const MERGE_MAP = {
  // --- WEB DEVELOPMENT: BROWSERS ---
  'ie': 'internet explorer',
  'ie 6': 'internet explorer',
  'ie6': 'internet explorer',
  'ie7': 'internet explorer',
  'ie8': 'internet explorer',
  'internet explorer 8': 'internet explorer',
  'firefox extension': 'firefox',
  'opera 9': 'opera',
  'opera_browser': 'opera',
  'acid2': 'web standards',
  'acid2 test': 'web standards',
  'acid3': 'web standards',
  'standards': 'web standards',
  'doctype': 'web standards',
  'compatibility': 'web standards',
  'backwards compatibility': 'web standards',
  'quirks mode': 'web standards',

  // --- WEB DEVELOPMENT: LANGUAGES ---
  // CSS
  'css property': 'css',
  'list style': 'css',
  'border': 'css',
  'display': 'css',
  'background': 'css',
  'background image': 'css',
  'font rendering': 'css',
  'table cell': 'css',
  'oocss': 'css',
  'box model': 'css',
  'html css': 'css',

  // JavaScript
  'javascript book': 'javascript',
  'closures': 'javascript',
  'prototypal': 'javascript',
  'prototype': 'javascript',
  'json': 'javascript',
  'dom': 'javascript',
  'advanced dom scripting': 'javascript',

  // XSLT / XML (Merge into one strong topic)
  'xslt 1.0': 'xslt',
  'xslt class': 'xslt',
  'beginning xslt': 'xslt',
  'mastering xml transformations': 'xslt',
  'exslt': 'xslt',
  'xpath': 'xslt',
  'xml': 'xslt',
  'doug tidwell': 'xslt',
  'jeni tennison': 'xslt',
  'wendell piez': 'xslt',

  // Scheme / Lisp
  'scheme programming language': 'scheme',
  'the scheme programming language': 'scheme',
  'little schemer': 'scheme',
  'plt': 'scheme',
  'kent dybvig': 'scheme',
  'functional': 'functional programming',
  'functional programming language': 'functional programming',

  // Python / Django
  'application framework': 'django',

  // --- DESIGN & UX ---
  'web design': 'design',
  'application design': 'design',
  'web site': 'design',
  'website': 'design',
  'interface': 'design',
  'usability': 'ux',
  'accessibility': 'ux',
  'screenreader': 'ux',
  'forms': 'ux',
  'web form design': 'ux',
  'label': 'ux',

  // --- TYPOGRAPHY ---
  'font': 'typography',
  'fonts': 'typography',
  'font sizes': 'typography',
  'type': 'typography',
  'glyphs': 'typography',
  'elements of typographic style': 'typography',
  'gutenburg': 'typography',
  'anti aliasing': 'typography',
  'style': 'typography',

  // --- CYCLING ---
  'bicycle': 'cycling',
  'bicycling': 'cycling',
  'bikes': 'cycling',
  'bike': 'cycling',
  'fixed gear': 'cycling',
  'lemond bike': 'cycling',
  'bianchi': 'cycling',
  'all-city': 'cycling',
  'le tour': 'cycling',
  'tour': 'cycling',
  'riding my bike': 'cycling',
  'gear ratio': 'cycling',

  // --- BASEBALL / RED SOX ---
  'boston red sox': 'red sox',
  'boston': 'red sox', // Context suggests Boston usually means Sox/Fenway
  'big papi': 'red sox',
  'david ortiz': 'red sox',
  'dustin pedroia': 'red sox',
  'manny': 'red sox',
  'fenway': 'red sox',
  'sox game': 'red sox',
  'tbs': 'baseball',
  'alcs': 'baseball',
  'alcs game': 'baseball',
  'game 7': 'baseball',
  'world series': 'baseball',
  'yankees': 'baseball',
  'white sox': 'baseball',
  'chicago white sox': 'baseball',
  'indians': 'baseball',
  'rockies': 'baseball',
  'cubs': 'baseball',
  'angels': 'baseball',
  'nationals': 'baseball',
  'orioles': 'baseball',
  'called out': 'baseball',
  'walk off': 'baseball',
  'home run': 'baseball',
  'dimitri young': 'baseball',
  'kenny lofton': 'baseball',

  // --- MUSIC ---
  'cello': 'classical music',
  'mahler': 'classical music',
  'sibelius': 'classical music',
  'tchaikovsky': 'classical music',
  'orchestras': 'classical music',
  'columbia orchestra': 'classical music',
  'gerard schwarz': 'classical music',
  'horn concerto': 'classical music',
  'music arts': 'music',
  'musician': 'music',
  'concert': 'music',

  // --- COOKING ---
  'food': 'cooking',
  'recipes': 'cooking',
  'dinner': 'cooking',
  'cabbage': 'cooking',
  'corned beef': 'cooking',
  'irish soda bread': 'cooking',
  'wings': 'cooking',
  'food network': 'cooking',
  'kobayashi': 'cooking', // Assuming hot dog eating context
  'hot dog eating competition': 'cooking',

  // --- PHOTOGRAPHY ---
  'photos': 'photography',
  'flicker': 'photography', // typo fix
  'flickr': 'photography',
  'ashes of kings': 'photography',
  'camera': 'photography',

  // --- LIFE / META ---
  'personal': 'life',
  'me': 'life',
  'random': 'life',
  'random thoughts': 'life',
  'thoughts': 'life',
  'update': 'life',
  'check-in': 'life',
  'snapshot': 'life',
  'this site': 'meta',
  'site': 'meta',
  'blog': 'meta',
  'uncategorized': 'life',
  'work': 'career',
  'writers guild': 'career', // strike context

  // --- MEDIA ---
  'books': 'reading',
  'book': 'reading',
  'bookshelf': 'reading',
  'review': 'reviews',
  'movies': 'film',
  'terrible movie': 'film',
  'scary': 'film',
  'rob zombie': 'film',
  'snakes on a plane': 'film',

  // --- LOCATIONS ---
  'kensington': 'maryland',
  'kensington md': 'maryland',
  'bethesda': 'maryland',
  'purple line': 'maryland',
  'east hampton': 'new york',
  'long island': 'new york',
  'amagansett': 'new york',
  'new york city': 'new york',
  'new york times': 'reading', // Likely reviewing an article
};

const contentDir = path.join(process.cwd(), 'src/content/blog');

function fixTags() {
  const files = fs.readdirSync(contentDir);
  console.log(`Processing ${files.length} files...`);

  files.forEach(file => {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) return;
    const filePath = path.join(contentDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Regex to find tags: ["a", "b"]
    const tagMatch = content.match(/tags:\s*\[(.*?)\]/);
    if (!tagMatch) return;

    let originalTagsArrayString = tagMatch[1];

    // Parse tags safely
    let tags = originalTagsArrayString
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map(t => t.trim().replace(/^['"]|['"]$/g, ''));

    let hasChanges = false;
    let newTags = new Set();

    tags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      if (MERGE_MAP[lowerTag]) {
        // Map to new tag
        newTags.add(MERGE_MAP[lowerTag]);
        hasChanges = true;
      } else {
        // Keep existing
        newTags.add(tag);
      }
    });

    if (hasChanges) {
      // Clean up: Remove empty strings and 'Uncategorized' if it slipped through
      newTags.delete('');
      newTags.delete('Uncategorized');

      const sortedTags = Array.from(newTags).sort().map(t => `"${t}"`);
      const newTagLine = `tags: [${sortedTags.join(', ')}]`;

      const newContent = content.replace(tagMatch[0], newTagLine);
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`✅ ${file}: Merged tags`);
    }
  });
}

fixTags();
