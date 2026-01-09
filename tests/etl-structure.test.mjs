import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = path.join(__dirname, '../scripts');

const fetchFiles = fs.readdirSync(scriptsDir)
  .filter(f => f.endsWith('-fetch.mjs'));

describe('ETL Script Structure', () => {
  it.each(fetchFiles)('should follow the ETL pattern: %s', async (filename) => {
    const filePath = path.join(scriptsDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. Verify it imports runETL from lib-etl
    // Matches: import { runETL } from ... or import { runETL, other } from ...
    expect(content).toMatch(/import\s+\{.*runETL.*\}\s+from\s+['"]\.\/lib-etl\.mjs['"]/);

    // 2. Verify it exports a run function
    // We use dynamic import to verify the actual export exists
    const modulePath = path.join(scriptsDir, filename);
    const module = await import(modulePath);
    expect(module.run).toBeDefined();
    expect(typeof module.run).toBe('function');

    // 3. Verify it has the self-execution block for CLI usage
    // This ensures the script can be run directly via node
    const usesUrlPathname = content.includes('process.argv[1] === new URL(import.meta.url).pathname');
    const usesFileUrlToPath = content.includes('process.argv[1] === fileURLToPath(import.meta.url)');
    
    expect(usesUrlPathname || usesFileUrlToPath, 
      'Should contain a self-execution block checking process.argv[1] against the module path'
    ).toBe(true);

    // Ensure run() is actually called in that block
    expect(content).toMatch(/\{\s*run\(\);\s*\}/);
  });
});
