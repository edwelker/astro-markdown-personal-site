import fs from 'fs';
import path from 'path';

// Adjust if your content is somewhere else
const CONTENT_DIR = './src/content';

function walk(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      processFile(filePath);
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Regex to find the whole {{< figure ... >}} block
  // It handles the user's specific curly quotes “ ” and standard quotes " "
  const figureRegex = /{{<\s*figure\s+([^>]+)\s*>}}/g;

  content = content.replace(figureRegex, (match, attributes) => {
    // Extract individual attributes using a helper
    const src = getAttr(attributes, 'src');
    const link = getAttr(attributes, 'link');
    const title = getAttr(attributes, 'title');
    const alt = getAttr(attributes, 'alt') || title; // Fallback to title if no alt

    // If we are missing the src, we can't really fix it, so leave it alone or log it
    if (!src) {
      console.warn(`[WARN] Found figure without src in ${filePath}`);
      return match;
    }

    // Construct standard HTML <figure> replacement
    // This is valid in .md and .mdx and renders perfectly in Astro
    let html = `<figure>\n`;

    if (link) {
      html += `  <a href="${link}" target="_blank">\n`;
      html += `    <img src="${src}" alt="${alt}" />\n`;
      html += `  </a>\n`;
    } else {
      html += `  <img src="${src}" alt="${alt}" />\n`;
    }

    if (title) {
      html += `  <figcaption>${title}</figcaption>\n`;
    }

    html += `</figure>`;

    return html;
  });

  // Only write to disk if something actually changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[UPDATED] ${filePath}`);
  }
}

// Helper to parse attributes like: src="foo" or src=“foo”
function getAttr(str, name) {
  // Matches name="value" or name=“value”
  // \s matches space, [“"] matches opening quote, ([^”"]+) matches content, [”"] matches closing
  const pattern = new RegExp(`${name}\\s*=\\s*["“]([^"”]+)["”]`);
  const match = str.match(pattern);
  return match ? match[1] : '';
}

console.log('Migrating Hugo figures to HTML...');
walk(CONTENT_DIR);
console.log('Done.');
