import fs from 'fs';
import path from 'path';

// CONFIGURATION
const CONTENT_DIR = './src/content'; // Ensure this matches where your markdown is
const DRY_RUN = false; // Set to true if you just want to see logs without writing files

console.log("========================================");
console.log("   STARTING VERBOSE XML FIXER");
console.log("========================================");

function walk(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`❌ ERROR: Directory does not exist: ${dir}`);
    return;
  }

  console.log(`📂 Entering directory: ${dir}`);

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
  // console.log(`   📄 Reading file: ${path.basename(filePath)}`);
  const content = fs.readFileSync(filePath, 'utf8');

  // REGEX EXPLANATION:
  // (<pre\s+[^>]*lang=["']?xml["']?[^>]*>)  -> Group 1: The opening tag (e.g. <pre lang="xml">)
  // ([\s\S]*?)                               -> Group 2: The content inside (non-greedy)
  // (<\/pre>)                                -> Group 3: The closing tag
  const regex = /(<pre\s+[^>]*lang=["']?xml["']?[^>]*>)([\s\S]*?)(<\/pre>)/gi;

  let matchFound = false;
  let newFileContent = content;

  // We use replace function to process every match found in the file
  newFileContent = content.replace(regex, (fullMatch, openTag, innerXml, closeTag, offset) => {
    matchFound = true;
    console.log(`\n✅ MATCH FOUND in: ${filePath}`);
    console.log(`   📍 At Index: ${offset}`);
    console.log(`   🏷️  Opening Tag Found: ${openTag}`);
    console.log(`   👀 Content Preview (First 50 chars): ${innerXml.substring(0, 50).replace(/\n/g, '\\n')}...`);

    // FORMATTING LOGIC
    const formattedXml = formatXml(innerXml);

    // If the formatted version is different, we have a winner
    if (formattedXml.trim() !== innerXml.trim()) {
      console.log(`   ✨ Formatting applied.`);
      return `${openTag}\n${formattedXml}\n${closeTag}`;
    } else {
      console.log(`   ⚠️  Content was already formatted. No change.`);
      return fullMatch;
    }
  });

  if (matchFound) {
    if (newFileContent !== content) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newFileContent, 'utf8');
        console.log(`   💾 SAVED CHANGES to ${path.basename(filePath)}`);
      } else {
        console.log(`   🚫 DRY RUN: Skipping save.`);
      }
    }
  } else {
    // Optional: Log if we found NOTHING to confirm we scanned it
    // console.log(`   (No <pre lang="xml"> tags found)`);
  }
}

function formatXml(xml) {
  // 1. Remove all existing newlines and extra spaces between tags to get a clean slate
  //    Matches > followed by whitespace followed by <
  let clean = xml.replace(/>\s*</g, '><').trim();

  // 2. Add newlines between tags
  clean = clean.replace(/>\s*</g, '>\n<');

  const lines = clean.split('\n');
  let indentLevel = 0;
  const indentStr = '  '; // 2 spaces

  return lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';

    let currentIndent = indentLevel;

    // LOGIC TO DETERMINE INDENT
    const isClosing = trimmed.startsWith('</');
    // Detect opening tags.
    // We ignore <?xml ... ?> and <!DOCTYPE> and self-closing <tag />
    // We also ignore the ?? typo you mentioned: <?xml ... ??>
    const isProcessingInstruction = trimmed.startsWith('<?') || trimmed.startsWith('<!');
    const isOpening = trimmed.startsWith('<') && !isClosing && !isProcessingInstruction && !trimmed.endsWith('/>');

    if (isClosing) {
      indentLevel--;
      if (indentLevel < 0) indentLevel = 0;
      currentIndent = indentLevel;
    }

    // Check for "One-Liner" (Opening and Closing on same line)
    // e.g. <name>Value</name>
    // Logic: Starts with <tag>, contains </tag>
    const tagMatch = trimmed.match(/^<([^\s>]+)/);
    const tagName = tagMatch ? tagMatch[1] : null;
    // Ensure the closing tag matches the opening tag name
    const isOneLiner = tagName && trimmed.includes(`</${tagName}>`);

    if (isOpening && !isOneLiner) {
      indentLevel++;
    }

    return indentStr.repeat(currentIndent) + trimmed;
  }).join('\n');
}

walk(CONTENT_DIR);
console.log("\n========================================");
console.log("   SCAN COMPLETE");
console.log("========================================");
