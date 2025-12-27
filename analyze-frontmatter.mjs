import fs from 'fs';
import path from 'path';

const BLOG_PATH = './src/content/blog';
const files = fs.readdirSync(BLOG_PATH).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

const report = {
  singleQuoted: [],
  doubleQuoted: [],
  unquoted: [],
  brokenDashes: [],
  specialCharRisks: []
};

files.forEach(file => {
  const content = fs.readFileSync(path.join(BLOG_PATH, file), 'utf-8');
  const lines = content.split('\n');
  
  if (lines[0] !== '---') {
    report.brokenDashes.push(file);
    return;
  }

  let titleLine = lines.find(l => l.startsWith('title:'));
  let slugLine = lines.find(l => l.startsWith('slug:'));

  if (titleLine) {
    const value = titleLine.replace('title:', '').trim();
    
    // Check quoting style
    if (value.startsWith("'") && value.endsWith("'")) {
      report.singleQuoted.push(file);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      report.doubleQuoted.push(file);
    } else {
      report.unquoted.push(file);
      // Check for dangerous characters in unquoted strings
      if (/[:%&?#\[\]{}]/.test(value)) {
        report.specialCharRisks.push({ file, value });
      }
    }
  }
});

console.log('--- FRONTMATTER ANALYSIS ---');
console.log(`Total Files: ${files.length}`);
console.log(`Single Quoted: ${report.singleQuoted.length}`);
console.log(`Double Quoted: ${report.doubleQuoted.length}`);
console.log(`Unquoted:      ${report.unquoted.length}`);
console.log(`Broken Header: ${report.brokenDashes.length}`);
console.log('\n--- RISK: UNQUOTED SPECIAL CHARS ---');
report.specialCharRisks.forEach(risk => {
  console.log(`${risk.file}: ${risk.value}`);
});
