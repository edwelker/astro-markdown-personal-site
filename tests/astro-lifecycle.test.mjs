import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

describe('Astro View Transitions Lifecycle', () => {
  it('gas page script should be initialized with astro:page-load', async () => {
    const filePath = path.resolve(process.cwd(), 'src/components/pages/GasRegionList.page.astro');
    const content = await fs.readFile(filePath, 'utf-8');

    // This test ensures the client-side script on the gas page is compatible with
    // Astro's View Transitions. It must wrap its logic in an init function (or import it) and
    // attach it to the `astro:page-load` event.
    
    // Check for inline definition OR import
    const hasInitFunction = /function initGasPage\(\) {/.test(content) || /import\s+\{\s*initGasPage\s*\}\s+from/.test(content);
    const hasEventListener = /document\.addEventListener\('astro:page-load', initGasPage\);/.test(content);

    expect(hasInitFunction, 
      'The gas page script must contain or import `initGasPage`'
    ).toBe(true);
    
    expect(hasEventListener, 
      'The gas page script must register `initGasPage` with `astro:page-load`'
    ).toBe(true);
  });

  it('sports page script should be initialized with astro:page-load', async () => {
    const filePath = path.resolve(process.cwd(), 'src/pages/sports.astro');
    const content = await fs.readFile(filePath, 'utf-8');

    // This test ensures the client-side script on the sports page is compatible with
    // Astro's View Transitions.
    const hasInitFunction = /function initSportsPage\(\) {/.test(content);
    const hasEventListener = /document\.addEventListener\('astro:page-load', initSportsPage\);/.test(content);

    expect(hasInitFunction, 
      'The sports page script must contain a `function initSportsPage() { ... }`'
    ).toBe(true);

    expect(hasEventListener, 
      'The sports page script must register `initSportsPage` with `astro:page-load`'
    ).toBe(true);
  });
});
