import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../src/pages/api/matrix.js';

describe('API Matrix Endpoint', () => {
  // Store original env to restore after tests
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
    // Restore environment
    try {
      import.meta.env.ORS_API_KEY = originalApiKey;
    } catch (e) {
      // Ignore if read-only
    }
  });

  it('returns 500 if API key is missing', async () => {
    // Try to unset the key for this test
    try {
      import.meta.env.ORS_API_KEY = '';
    } catch (e) {
      // If we can't unset it (read-only), and it exists, we skip this assertion
      if (originalApiKey) return;
    }

    const request = {
      json: vi.fn().mockResolvedValue({}),
    };
    const locals = {}; // No runtime env

    const response = await POST({ request, locals });
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.message).toContain('ORS_API_KEY not found');
  });

  it('forwards request to ORS when API key is in locals', async () => {
    const mockBody = { locations: [[0,0], [1,1]] };
    const request = {
      json: vi.fn().mockResolvedValue(mockBody),
    };
    const locals = {
      runtime: {
        env: {
          ORS_API_KEY: 'test-key-locals'
        }
      }
    };

    const mockResponseData = { distances: [[0, 10], [10, 0]] };
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockResponseData),
    });

    const response = await POST({ request, locals });

    expect(fetch).toHaveBeenCalledWith('https://api.openrouteservice.org/v2/matrix/driving-car', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'test-key-locals'
      },
      body: JSON.stringify(mockBody)
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockResponseData);
  });

  it('uses import.meta.env key if locals is missing', async () => {
    // Set a test key in env
    const testKey = 'test-key-env';
    try {
      import.meta.env.ORS_API_KEY = testKey;
    } catch (e) {
      // If read-only, we use whatever is there
    }
    const effectiveKey = import.meta.env.ORS_API_KEY;

    // If no key available at all, skip test
    if (!effectiveKey) return;

    const mockBody = { locations: [[0,0], [1,1]] };
    const request = {
      json: vi.fn().mockResolvedValue(mockBody),
    };
    const locals = {};

    const mockResponseData = { distances: [[0, 10], [10, 0]] };
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockResponseData),
    });

    const response = await POST({ request, locals });

    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      headers: expect.objectContaining({
        'Authorization': effectiveKey
      })
    }));
    expect(response.status).toBe(200);
  });

  it('handles fetch errors from ORS', async () => {
    const request = {
      json: vi.fn().mockResolvedValue({}),
    };
    const locals = {
      runtime: { env: { ORS_API_KEY: 'key' } }
    };

    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ error: 'Bad Request' }),
    });

    const response = await POST({ request, locals });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'Bad Request' });
  });

  it('handles internal errors (e.g. invalid JSON)', async () => {
    const request = {
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    };
    const locals = {
      runtime: { env: { ORS_API_KEY: 'key' } }
    };

    const response = await POST({ request, locals });
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.message).toBe('Invalid JSON');
  });
});
