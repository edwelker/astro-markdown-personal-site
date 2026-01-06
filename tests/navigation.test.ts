import { describe, it, expect } from 'vitest';
import { mainLinks, secondaryLinks } from '../src/lib/nav-links';

describe('Navigation Links', () => {
  it('should have Media as the last item in secondary links', () => {
    const lastLink = secondaryLinks[secondaryLinks.length - 1];
    expect(lastLink.label).toBe('Media');
    expect(lastLink.href).toBe('/media/');
  });

  it('should have expected main links', () => {
    const labels = mainLinks.map(l => l.label);
    expect(labels).toContain('About');
    expect(labels).toContain('Blog');
    expect(labels).toContain('Music');
    expect(labels).not.toContain('Media'); // Moved to secondary
  });

  it('should have expected secondary links', () => {
    const labels = secondaryLinks.map(l => l.label);
    expect(labels).toContain('GasPrices');
    expect(labels).toContain('Sports');
    expect(labels).toContain('Uses');
    expect(labels).toContain('Media');
  });
});
