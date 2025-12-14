import fs from 'fs';
import path from 'path';

// Adjust directory if needed
const CONTENT_DIR = './src/content';

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
  const content = fs.readFileSync(filePath, 'utf8');

  // Regex to find <pre lang="xml">...content...</pre>
  // [\s\S]*? matches any character (including newlines) non-greedily
  const regex = /<pre lang="xml">([\s\S]*?)<\/pre>/g;

  let hasChanges = false;

  const newContent = content.replace(regex, (match, xmlContent) => {
    hasChanges = true;
    const formatted = prettifyXml(xmlContent);
    return `<pre lang="xml">\n${formatted}\n</pre>`;
  });

  if (hasChanges && newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Formatted XML in: ${filePath}`);
  }
}

// A lightweight, zero-dependency XML pretty printer
function prettifyXml(xml) {
  // 1. Remove existing newlines/whitespace between tags to normalize
  let clean = xml.replace(/>\s*</g, '><').trim();

  // 2. Insert newlines between tags
  // This puts every tag on its own line temporarily
  clean = clean.replace(/>\s*</g, '>\n<');

  const lines = clean.split('\n');
  let indentLevel = 0;
  const indentStr = '  '; // 2 spaces

  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    let currentIndent = indentLevel;

    // DETECT TAG TYPES
    const isClosing = trimmed.startsWith('</');
    // Matches <tag> but not </tag>, <?xml>, or <tag />
    const isOpening = trimmed.startsWith('<') &&
                      !isClosing &&
                      !trimmed.startsWith('<?') &&
                      !trimmed.startsWith('<!') &&
                      !trimmed.endsWith('/>') &&
                      !trimmed.endsWith('?>'); // Handles the ?? typo in your prompt

    // If it's a closing tag, we decrease indent BEFORE printing
    if (isClosing) {
      indentLevel--;
      currentIndent = indentLevel;
    }

    // Special Handling:
    // If a line has both opening and closing (e.g. <name>Value</name>),
    // we effectively "open" then "close" on the same line, so net change is 0.
    // However, our `isOpening` check above is naive.
    // Let's refine: If it opens, we assume indent++, UNLESS it also closes.
    const hasImmediateClosing = trimmed.match(/<[^>]+>.*<\/[^>]+>/);

    if (isOpening && !hasImmediateClosing) {
      indentLevel++;
    }

    // Protection against negative indents (malformed XML)
    if (currentIndent < 0) currentIndent = 0;

    return indentStr.repeat(currentIndent) + trimmed;
  });

  return formattedLines.join('\n');
}

console.log("🧹 Scanning and formatting XML blocks...");
walk(CONTENT_DIR);
console.log("Done.");
