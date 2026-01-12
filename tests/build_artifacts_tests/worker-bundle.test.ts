import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Cloudflare Worker Bundle', () => {
  it('should not contain "node:path" or "node:path/posix" imports', () => {
    // The Cloudflare adapter outputs the worker script to dist/_worker.js
    let workerPath = path.join(process.cwd(), 'dist', '_worker.js');

    if (!fs.existsSync(workerPath)) {
      // If the build hasn't run, we can't test the artifact.
      // In a CI environment, 'npm run build' (which includes this test) runs the build first.
      throw new Error(
        `_worker.js not found at ${workerPath}. Ensure 'astro build' has run before this test.`
      );
    }

    // If _worker.js is a directory, look for index.js inside it
    if (fs.statSync(workerPath).isDirectory()) {
      workerPath = path.join(workerPath, 'index.js');
    }

    const content = fs.readFileSync(workerPath, 'utf-8');

    // We look for the string literal inside quotes, which is how imports/requires appear in the bundle.
    // If the polyfill is working, these should be replaced by code from 'path-browserify'.
    const nodePathImport = /["']node:path["']/;
    const nodePathPosixImport = /["']node:path\/posix["']/;

    const hasNodePath = nodePathImport.test(content);
    const hasNodePathPosix = nodePathPosixImport.test(content);

    if (hasNodePath || hasNodePathPosix) {
      console.error(
        'Found forbidden Node.js imports in the worker bundle. The polyfill alias in astro.config.mjs might be missing or not working.'
      );
    }

    expect(hasNodePath, 'Worker bundle contains "node:path" import').toBe(false);
    expect(hasNodePathPosix, 'Worker bundle contains "node:path/posix" import').toBe(false);
  });
});
