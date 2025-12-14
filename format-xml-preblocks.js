import fs from 'fs';
import path from 'path';

// Adjust this to your specific content folder
const CONTENT_DIR = './src/content/blog';

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      processFile(filePath);
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find <pre lang="xml">...stuff...</pre>
  const regex = /<pre\s+lang=["']?xml["']?\s*>([\s\S]*?)<\/pre>/gi;

  if (!regex.test(content)) return;

  let hasChanges = false;

  const newContent = content.replace(regex, (match, innerContent) => {
    console.log(`\n🧹 Cleaning XML in: ${path.basename(filePath)}`);

    // Step 1: Strip ALL HTML tags inside the block (<span...>, </div>, etc)
    let clean = innerContent.replace(/<[^>]+>/g, '');

    // Step 2: Unescape common HTML entities
    clean = clean
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\\"/g, '"'); // Fix escaped quotes from your snippet

    // Step 3: Format the now-clean XML
    const formatted = prettifyXml(clean);
    hasChanges = true;

    // Return clean standard Markdown code block
    return `<pre lang="xml">\n${formatted}\n</pre>`;
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ FIXED: ${filePath}`);
  }
}

function prettifyXml(xml) {
  // Normalize whitespace
  let clean = xml.replace(/\r?\n|\r/g, '').trim();
  clean = clean.replace(/>\s*</g, '>\n<');

  const lines = clean.split('\n');
  let indentLevel = 0;
  const indentStr = '  ';

  return lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';

    let currentIndent = indentLevel;

    // Detect Types
    const isClosing = trimmed.startsWith('</');
    const isOpening = trimmed.startsWith('<') &&
                      !isClosing &&
                      !trimmed.startsWith('<?') &&
                      !trimmed.startsWith('<!') &&
                      !trimmed.endsWith('/>') &&
                      !trimmed.includes('??>');

    if (isClosing) {
      indentLevel--;
      currentIndent = indentLevel;
    }

    // Check for one-liners like <name>Value</name>
    // We look for a closing tag matching the opening tag name
    const tagMatch = trimmed.match(/^<([^\s>]+)/);
    const tagName = tagMatch ? tagMatch[1] : null;
    const isOneLiner = tagName && trimmed.includes(`</${tagName}>`);

    if (isOpening && !isOneLiner) {
      indentLevel++;
    }

    if (currentIndent < 0) currentIndent = 0;

    return indentStr.repeat(currentIndent) + trimmed;
  }).join('\n');
}

console.log(`🚀 Scrubbing highlighted HTML from ${CONTENT_DIR}...`);
walk(CONTENT_DIR);
