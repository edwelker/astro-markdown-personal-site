import { describe, it, expect } from 'vitest';

describe('Type Definitions', () => {
  it('can import type modules', async () => {
    const types = await import('../src/types');
    const traktTypes = await import('../src/types/trakt');
    
    expect(types).toBeDefined();
    expect(traktTypes).toBeDefined();
  });
});
