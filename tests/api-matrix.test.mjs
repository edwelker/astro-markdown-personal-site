import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../src/pages/api/matrix.js';

function createRequest(body, headers = { origin: 'https://eddiewelker.com' }) {
  return {
    headers: new Headers(headers),
    json: vi.fn().mockResolvedValue(body),
  };
}

const VALID_BODY = {
  locations: [
    [-76.861, 39.2037],
    [-76.85, 39.21],
  ],
  sources: [0],
  destinations: [1],
  metrics: ['duration', 'distance'],
  units: 'mi',
};

const PROD_LOCALS = {
  runtime: {
    env: {
      ORS_API_KEY: 'test-key-locals',
    },
  },
};

describe('API Matrix Endpoint', () => {
  const originalApiKey = import.meta.env.ORS_API_KEY;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('console', {
      log: vi.fn(),
      error: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    try {
      import.meta.env.ORS_API_KEY = originalApiKey;
    } catch {
      // Ignore if read-only
    }
  });

  describe('Origin / Referer validation', () => {
    it('rejects requests with missing Origin and Referer headers', async () => {
      const request = createRequest(VALID_BODY, {});
      const response = await POST({ request, locals: PROD_LOCALS });

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ message: 'Forbidden' });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('rejects requests from disallowed origins', async () => {
      const request = createRequest(VALID_BODY, { origin: 'https://evil.example.com' });
      const response = await POST({ request, locals: PROD_LOCALS });

      expect(response.status).toBe(403);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('rejects disallowed Origin even if Referer is valid', async () => {
      const request = createRequest(VALID_BODY, {
        origin: 'https://evil.example.com',
        referer: 'https://eddiewelker.com/gas/columbia_md/',
      });
      const response = await POST({ request, locals: PROD_LOCALS });

      expect(response.status).toBe(403);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('rejects localhost in production runtime', async () => {
      const request = createRequest(VALID_BODY, { origin: 'http://localhost:4321' });
      const response = await POST({ request, locals: PROD_LOCALS });

      expect(response.status).toBe(403);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('allows localhost in local dev when runtime is absent', async () => {
      try {
        import.meta.env.ORS_API_KEY = 'dev-key';
      } catch {
        // Ignore if read-only
      }
      if (!import.meta.env.ORS_API_KEY) return;

      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ distances: [[1.2]], durations: [[120]] }),
      });

      const request = createRequest(VALID_BODY, { origin: 'http://localhost:4321' });
      const response = await POST({ request, locals: {} });

      expect(response.status).toBe(200);
    });

    it('allows www.eddiewelker.com, Cloudflare Pages previews, and valid Referer fallback', async () => {
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ distances: [[1.2]], durations: [[120]] }),
      });

      const allowedHeadersList = [
        { origin: 'https://www.eddiewelker.com' },
        { origin: 'https://preview-123.website.pages.dev' },
        { referer: 'https://eddiewelker.com/gas/columbia_md/' },
      ];

      for (const headers of allowedHeadersList) {
        const request = createRequest(VALID_BODY, headers);
        const response = await POST({ request, locals: PROD_LOCALS });
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Payload validation & whitelisting', () => {
    it('returns 400 on invalid JSON', async () => {
      const request = {
        headers: new Headers({ origin: 'https://eddiewelker.com' }),
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
      };

      const response = await POST({ request, locals: PROD_LOCALS });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ message: 'Invalid JSON body' });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('returns 400 when body is not a plain object', async () => {
      for (const badBody of [null, [], 'string', 42]) {
        const request = createRequest(badBody);
        const response = await POST({ request, locals: PROD_LOCALS });
        expect(response.status).toBe(400);
      }
      expect(fetch).not.toHaveBeenCalled();
    });

    it('returns 400 when locations is missing, too few, or exceeds max (50)', async () => {
      const tooMany = Array.from({ length: 51 }, (_, i) => [-76 + i * 0.001, 39]);

      for (const badLocations of [undefined, 'not-array', [], [[-76, 39]], tooMany]) {
        const request = createRequest({ locations: badLocations });
        const response = await POST({ request, locals: PROD_LOCALS });
        expect(response.status).toBe(400);
      }
      expect(fetch).not.toHaveBeenCalled();
    });

    it('returns 400 for malformed or out-of-bounds coordinates', async () => {
      const badPayloads = [
        { locations: [[-76, 39], [-76]] },
        {
          locations: [
            [-76, 39],
            ['a', 39],
          ],
        },
        {
          locations: [
            [-76, 39],
            [NaN, 39],
          ],
        },
        {
          locations: [
            [-76, 39],
            [Infinity, 39],
          ],
        },
        {
          locations: [
            [-181, 39],
            [-76, 39],
          ],
        },
        {
          locations: [
            [181, 39],
            [-76, 39],
          ],
        },
        {
          locations: [
            [-76, -91],
            [-76, 39],
          ],
        },
        {
          locations: [
            [-76, 91],
            [-76, 39],
          ],
        },
      ];

      for (const payload of badPayloads) {
        const request = createRequest(payload);
        const response = await POST({ request, locals: PROD_LOCALS });
        expect(response.status).toBe(400);
      }
      expect(fetch).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid sources, destinations, metrics, or units', async () => {
      const badPayloads = [
        { ...VALID_BODY, sources: [] },
        { ...VALID_BODY, sources: [5] },
        { ...VALID_BODY, sources: [-1] },
        { ...VALID_BODY, sources: [0.5] },
        { ...VALID_BODY, destinations: [2] },
        { ...VALID_BODY, metrics: ['invalid'] },
        { ...VALID_BODY, metrics: [] },
        { ...VALID_BODY, units: 'furlongs' },
      ];

      for (const payload of badPayloads) {
        const request = createRequest(payload);
        const response = await POST({ request, locals: PROD_LOCALS });
        expect(response.status).toBe(400);
      }
      expect(fetch).not.toHaveBeenCalled();
    });

    it('strips non-whitelisted fields before forwarding to ORS', async () => {
      const bodyWithExtras = {
        ...VALID_BODY,
        resolve_locations: true,
        id: 'injected-id',
        extraField: { nested: true },
      };

      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ distances: [[1.2]], durations: [[120]] }),
      });

      const request = createRequest(bodyWithExtras);
      const response = await POST({ request, locals: PROD_LOCALS });

      expect(response.status).toBe(200);
      expect(fetch).toHaveBeenCalledWith('https://api.heigit.org/openrouteservice/v2/matrix/driving-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'test-key-locals',
        },
        body: JSON.stringify(VALID_BODY),
      });
    });
  });

  describe('Environment & Upstream handling', () => {
    it('returns 500 without leaking internals if API key is missing', async () => {
      try {
        import.meta.env.ORS_API_KEY = '';
      } catch {
        if (originalApiKey) return;
      }

      const request = createRequest(VALID_BODY);
      const response = await POST({ request, locals: {} });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ message: 'Service configuration error' });
    });

    it('forwards valid request to ORS when API key is in locals', async () => {
      const mockBody = {
        locations: [
          [0, 0],
          [1, 1],
        ],
      };
      const mockResponseData = {
        distances: [
          [0, 10],
          [10, 0],
        ],
      };
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponseData),
      });

      const request = createRequest(mockBody);
      const response = await POST({ request, locals: PROD_LOCALS });

      expect(fetch).toHaveBeenCalledWith('https://api.heigit.org/openrouteservice/v2/matrix/driving-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'test-key-locals',
        },
        body: JSON.stringify(mockBody),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(mockResponseData);
    });

    it('uses import.meta.env key if locals is missing', async () => {
      try {
        import.meta.env.ORS_API_KEY = 'test-key-env';
      } catch {
        // Ignore if read-only
      }
      const effectiveKey = import.meta.env.ORS_API_KEY;
      if (!effectiveKey) return;

      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ distances: [[0, 10]] }),
      });

      const request = createRequest(VALID_BODY);
      const response = await POST({ request, locals: {} });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: effectiveKey,
          }),
        })
      );
      expect(response.status).toBe(200);
    });

    it('forwards error status from ORS', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: 'Bad Request' }),
      });

      const request = createRequest(VALID_BODY);
      const response = await POST({ request, locals: PROD_LOCALS });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Bad Request' });
    });

    it('returns 502 without leaking internals when upstream fetch throws', async () => {
      fetch.mockRejectedValue(new Error('ECONNRESET internal socket details'));

      const request = createRequest(VALID_BODY);
      const response = await POST({ request, locals: PROD_LOCALS });

      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({ message: 'Failed to calculate route matrix' });
    });
  });
});
