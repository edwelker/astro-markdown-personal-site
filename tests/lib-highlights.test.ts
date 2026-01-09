import { describe, it, expect } from 'vitest';
import { getAllHighlights } from '../src/lib/highlights';
import { highlights } from '../src/data/highlights';

describe('Highlights Lib', () => {
  it('getAllHighlights returns the highlights data', async () => {
    const result = await getAllHighlights();
    expect(result).toEqual(highlights);
  });
});
