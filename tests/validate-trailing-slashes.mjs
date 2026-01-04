import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');
const SITE_URL = 'https://eddiewelker.com';

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else {
      // Check source files where links might be defined
      if (/\.(astro|tsx|jsx|js|ts)$/.test(file)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

console.log('Scanning source code for internal links missing trailing slashes...');

const files = getFiles(srcDir);
let hasError = false;
let linksChecked = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Regex to capture href values in quotes
  // Matches href="value" or href='value'
  const hrefRegex = /href\s*=\s*(["'])(.*?)\1/g;
  let match;
  
  while ((match = hrefRegex.exec(content)) !== null) {
    const url = match[2];
    linksChecked++;
    
    // 1. Filter for internal links or absolute links to our site
    const isInternal = url.startsWith('/');
    const isAbsoluteSite = url.startsWith(SITE_URL);
    
    if (!isInternal && !isAbsoluteSite) continue;
    
    // 2. Ignore root, empty, or just the domain
    if (url === '/' || url === SITE_URL || url === `${SITE_URL}/`) continue;
    
    // 3. Ignore anchors (e.g. #top or /page#section)
    // We only care about the path part
    if (url.startsWith('#')) continue;
    
    // 4. Ignore protocol relative //
    if (url.startsWith('//')) continue;

    // Strip query params and anchors to check the path
    const urlPath = url.split(/[?#]/)[0];

    // 5. Ignore if it already ends with /
    if (urlPath.endsWith('/')) continue;
    
    // 6. Ignore files (heuristic: last segment contains a dot, e.g. style.css, image.jpg)
    const lastSegment = urlPath.split('/').pop();
    if (lastSegment && lastSegment.includes('.')) continue;

    // If we got here, it's a link like "/about" or "https://site.com/blog" without a slash
    console.error(`\n[FAIL] Missing trailing slash in ${path.relative(process.cwd(), file)}`);
    console.error(`Link: ${url}`);
    hasError = true;
  }
}

console.log(`Checked ${linksChecked} links across ${files.length} files.`);

if (hasError) {
  console.error('\nFAILED: Internal links found without trailing slashes.');
  process.exit(1);
} else {
  console.log('\nPASSED: All internal links have trailing slashes.');
  process.exit(0);
}
