import { describe, it, expect } from 'vitest';

describe('Trakt Data Integrity', () => {
  it('should have a valid schema', async () => {
    const data = await import('../src/data/trakt.json');
    expect(data.allRatings).toBeDefined();
    expect(Array.isArray(data.allRatings)).toBe(true);
  });
});
