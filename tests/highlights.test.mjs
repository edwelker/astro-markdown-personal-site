import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getHighlightIcon, enrichHighlightsWithImages } from '../src/data/highlights.ts';

describe('Highlights Logic', () => {
  describe('getHighlightIcon', () => {
    it('returns correct icon for code', () => {
      const icon = getHighlightIcon('code');
      expect(icon).toContain('<svg');
      expect(icon).toContain('polyline');
    });

    it('returns correct icon for photos', () => {
      const icon = getHighlightIcon('photos');
      expect(icon).toContain('<svg');
      expect(icon).toContain('rect');
    });

    it('returns null for unknown type', () => {
      expect(getHighlightIcon('unknown')).toBeNull();
    });
  });

  describe('enrichHighlightsWithImages', () => {
    beforeEach(() => {
      vi.resetAllMocks();
      global.fetch = vi.fn();
      // Suppress console.error during tests as we expect some errors
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns items unchanged if not photos type', async () => {
      const items = [
        {
          title: 'Test',
          type: 'code',
          url: 'http://google.com',
          date: '2023-01-01',
          description: 'desc',
        },
      ];
      const result = await enrichHighlightsWithImages(items);
      expect(result).toEqual(items);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns items unchanged if not google photos url', async () => {
      const items = [
        {
          title: 'Test',
          type: 'photos',
          url: 'http://flickr.com',
          date: '2023-01-01',
          description: 'desc',
        },
      ];
      const result = await enrichHighlightsWithImages(items);
      expect(result).toEqual(items);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns items unchanged if image already provided', async () => {
      const items = [
        {
          title: 'Test',
          type: 'photos',
          url: 'https://photos.google.com/share/123',
          image: 'existing.jpg',
          date: '2023-01-01',
          description: 'desc',
        },
      ];
      const result = await enrichHighlightsWithImages(items);
      expect(result).toEqual(items);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('fetches and extracts random image from google photos', async () => {
      const items = [
        {
          title: 'Test',
          type: 'photos',
          url: 'https://photos.google.com/share/123',
          date: '2023-01-01',
          description: 'desc',
        },
      ];

      // URL needs to be > 50 chars to pass the filter in highlights.ts
      const longUrl =
        'https://lh3.googleusercontent.com/some-very-long-string-that-is-definitely-longer-than-fifty-characters-to-match-regex';

      const mockHtml = `
        <html>
          <body>
            <img src="${longUrl}" />
          </body>
        </html>
      `;

      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await enrichHighlightsWithImages(items);

      expect(global.fetch).toHaveBeenCalledWith(items[0].url);
      expect(result[0].image).toBe(`${longUrl}=w1024`);
    });

    it('falls back to OG image if no random images found', async () => {
      const items = [
        {
          title: 'Test',
          type: 'photos',
          url: 'https://photos.google.com/share/123',
          date: '2023-01-01',
          description: 'desc',
        },
      ];

      const mockHtml = `
        <html>
          <head>
            <meta property="og:image" content="https://lh3.googleusercontent.com/og-image" />
          </head>
          <body>
            <!-- short urls ignored -->
            <img src="https://lh3.googleusercontent.com/short" /> 
          </body>
        </html>
      `;

      global.fetch.mockResolvedValue({
        ok: true,
        text: async () => mockHtml,
      });

      const result = await enrichHighlightsWithImages(items);

      expect(result[0].image).toBe('https://lh3.googleusercontent.com/og-image');
    });

    it('handles fetch errors gracefully', async () => {
      const items = [
        {
          title: 'Test',
          type: 'photos',
          url: 'https://photos.google.com/share/123',
          date: '2023-01-01',
          description: 'desc',
        },
      ];

      global.fetch.mockRejectedValue(new Error('Network error'));

      const result = await enrichHighlightsWithImages(items);

      expect(result).toEqual(items);
      expect(console.error).toHaveBeenCalled();
    });

    it('handles non-ok response gracefully', async () => {
      const items = [
        {
          title: 'Test',
          type: 'photos',
          url: 'https://photos.google.com/share/123',
          date: '2023-01-01',
          description: 'desc',
        },
      ];

      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await enrichHighlightsWithImages(items);

      expect(result).toEqual(items);
    });
  });
});
