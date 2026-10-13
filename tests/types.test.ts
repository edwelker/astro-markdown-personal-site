import { describe, it, expect } from 'vitest';

describe('Type Definitions', () => {
  it('can import type modules', async () => {
    const types = await import('../src/types');
    const plexTypes = await import('../src/types/plex');

    expect(types).toBeDefined();
    expect(plexTypes).toBeDefined();
  });
});
