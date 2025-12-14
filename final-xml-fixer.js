import fs from 'fs';
import path from 'path';

// FORCE this to the exact path Sherlock found
const TARGET_DIR = './src/content/blog';

console.log("========================================");
console.log("   NUCLEAR DEBUG & FIXER");
console.log("========================================");

function walk(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`❌ Path not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      // PRINT EVERY FILE TO PROVE WE TOUCHED IT
      // console.log(`🔎 Scanning: ${file}`);
      checkFile(filePath);
    }
  });
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // 1. First, just see if the file contains the word "xml" inside a pre tag roughly
  // This is a "sanity check" regex.
  if (!content.includes('<pre') || !content.includes('xml')) {
    return;
  }

  console.log(`\n🎯 POTENTIAL MATCH IN: ${path.basename(filePath)}`);

  // 2. The Capture Regex
  // Matches <pre (anything) > (anything) </pre>
  const captureRegex = /(<pre[\s\S]*?>)([\s\S]*?)(<\/pre>)/gi;

  let newContent = content;
  let hasChanges = false;

  newContent = content.replace(captureRegex, (fullMatch, openTag, innerContent, closeTag) => {
    // Filter: Only care if the opening tag mentions "xml"
    if (!openTag.toLowerCase().includes('xml')) {
      return fullMatch;
    }

    console.log(`   🏷️  Tag Found: ${openTag}`);

    // DEBUG: Show exactly what the script sees as "content"
    const preview = innerContent.trim().substring(0, 60).replace(/\n/g, '\\n');
    console.log(`   👀 Current Content: "${preview}..."`);

    // 3. Perform the Formatting
    const formatted = formatXml(innerContent);

    // Check if it actually changed anything
    if (formatted.trim() === innerContent.trim()) {
      console.log(`   ⚠️  Already formatted. Skipping.`);
      return fullMatch;
    }

    console.log(`   ✨ Fix Applied!`);
    hasChanges = true;
    return `${openTag}\n${formatted}\n${closeTag}`;
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`   💾 FILE SAVED.`);
  }
}

function formatXml(rawInput) {
  // 1. CLEAN UP: If the user has "span" tags from old highlighting, strip them.
  //    If the user has clean XML, this regex simply matches nothing and changes nothing.
  let clean = rawInput.replace(/<span[^>]*>/gi, '').replace(/<\/span>/gi, '');

  // 2. DECODE: Ensure &lt; becomes < so we can format it
  clean = clean
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  // 3. NORMALIZE: Remove newlines to start fresh
  clean = clean.replace(/\r?\n|\r/g, '').trim();
  clean = clean.replace(/>\s*</g, '><'); // remove spaces between tags

  // 4. SPLIT & INDENT
  clean = clean.replace(/>\s*</g, '>\n<'); // break lines

  const lines = clean.split('\n');
  let indent = 0;
  const pad = '  ';

  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';

    let currentIndent = indent;

    // Logic: If closing tag </...>, decrease indent
    if (trimmed.startsWith('</')) {
      indent--;
      currentIndent = indent;
    }

    // Logic: If opening tag <...>, increase indent for NEXT line
    // Ignore <?...?> and <.../>
    const isOpening = trimmed.startsWith('<') &&
                      !trimmed.startsWith('</') &&
                      !trimmed.startsWith('<?') &&
                      !trimmed.endsWith('/>');

    // One-liner check: <name>Bob</name> -> Don't indent
    const tagMatch = trimmed.match(/^<([^\s>]+)/);
    const tagName = tagMatch ? tagMatch[1] : null;
    const isOneLiner = tagName && trimmed.includes(`</${tagName}>`);

    if (isOpening && !isOneLiner) {
      indent++;
    }

    if (currentIndent < 0) currentIndent = 0;
    return pad.repeat(currentIndent) + trimmed;
  }).join('\n');
}

walk(TARGET_DIR);
