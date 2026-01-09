import { describe, it, expect } from 'vitest';
import { SITE, HOME, BLOG, RECIPES, HIGHLIGHTS, SOCIALS } from '../src/consts';

describe('Constants', () => {
  it('SITE has required properties', () => {
    expect(SITE.TITLE).toBeDefined();
    expect(SITE.DESCRIPTION).toBeDefined();
    expect(SITE.EMAIL).toBeDefined();
    expect(SITE.NUM_POSTS_ON_HOMEPAGE).toBeGreaterThan(0);
    expect(SITE.NUM_HIGHLIGHTS_ON_HOMEPAGE).toBeGreaterThan(0);
  });

  it('Metadata constants have TITLE and DESCRIPTION', () => {
    const metadatas = [HOME, BLOG, RECIPES, HIGHLIGHTS];
    metadatas.forEach((meta) => {
      expect(meta.TITLE).toBeDefined();
      expect(meta.DESCRIPTION).toBeDefined();
    });
  });

  it('SOCIALS is an array of links', () => {
    expect(Array.isArray(SOCIALS)).toBe(true);
    SOCIALS.forEach((social) => {
      expect(social.NAME).toBeDefined();
      expect(social.HREF).toBeDefined();
    });
  });
});
