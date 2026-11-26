import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Cloudflare Worker Bundle', () => {
  it('should not contain "node:path" or "node:path/posix" imports', () => {
    // Cloudflare Workers adapter (Astro 6/7) outputs to dist/server/entry.mjs; legacy Pages used dist/_worker.js
    const candidates = [
      path.join(process.cwd(), 'dist', 'server', 'entry.mjs'),
      path.join(process.cwd(), 'dist', '_worker.js', 'index.js'),
      path.join(process.cwd(), 'dist', '_worker.js'),
    ];
    const workerPath = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).isFile());

    if (!workerPath) {
      throw new Error(
        `Cloudflare worker bundle not found in dist/server/entry.mjs or dist/_worker.js. Ensure 'astro build' has run before this test.`
      );
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
