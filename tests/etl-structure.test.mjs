import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');

// List of ETL scripts that should follow the pattern
const ETL_SCRIPTS = [
  'cycling-fetch.mjs',
  'flickr-fetch.mjs',
  'gas-fetch.mjs',
  'music-fetch.mjs',
  'trakt-fetch.mjs'
];

describe('ETL Script Structure', () => {
  ETL_SCRIPTS.forEach(scriptName => {
    it(`should follow the ETL pattern: ${scriptName}`, () => {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, scriptName), 'utf-8');

      // 1. Should export a run() function
      expect(content).toMatch(/export async function run\(\)/);

      // 2. Should import runETL
      expect(content).toMatch(/import \{.*runETL.*\} from/);

      // 3. Should call runETL inside run()
      // Simple check: does the file contain 'await runETL({' ?
      expect(content).toMatch(/await runETL\(\{/);

      // 4. Should contain a self-execution block checking process.argv[1] against the module path
      // We now use a helper function runIfMain(import.meta.url, run)
      const usesRunIfMain = /runIfMain\(import\.meta\.url,\s*run\)/.test(content);
      
      // Legacy check for direct process.argv comparison (in case some scripts haven't migrated yet, though they should have)
      const usesUrlPathname = /process\.argv\[1\] === new URL\(import\.meta\.url\)\.pathname/.test(content);
      const usesFileUrlToPath = /process\.argv\[1\] === fileURLToPath\(import\.meta\.url\)/.test(content);

      expect(usesRunIfMain || usesUrlPathname || usesFileUrlToPath, 
        'Should contain a self-execution block (runIfMain or process.argv check)'
      ).toBe(true);
    });
  });
});
