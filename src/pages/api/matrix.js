export const prerender = false;

const ALLOWED_ORIGINS = new Set(['https://eddiewelker.com', 'https://www.eddiewelker.com']);
const ALLOWED_METRICS = new Set(['duration', 'distance']);
const ALLOWED_UNITS = new Set(['m', 'km', 'mi']);
const MIN_LOCATIONS = 2;
const MAX_LOCATIONS = 50;

function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isAllowedOrigin(originHeader, refererHeader, isProduction) {
  let candidateOrigin = null;

  if (originHeader) {
    try {
      const parsed = new URL(originHeader);
      if (parsed.origin !== originHeader) return false;
      candidateOrigin = parsed;
    } catch {
      return false;
    }
  } else if (refererHeader) {
    try {
      candidateOrigin = new URL(refererHeader);
    } catch {
      return false;
    }
  } else {
    return false;
  }

  if (ALLOWED_ORIGINS.has(candidateOrigin.origin)) {
    return true;
  }

  // Allow Cloudflare Pages preview domains (https://<subdomain>.pages.dev)
  if (
    candidateOrigin.protocol === 'https:' &&
    candidateOrigin.port === '' &&
    candidateOrigin.hostname.endsWith('.pages.dev') &&
    candidateOrigin.hostname.length > '.pages.dev'.length
  ) {
    return true;
  }

  // Allow localhost / 127.0.0.1 in non-production environments
  if (
    !isProduction &&
    candidateOrigin.protocol === 'http:' &&
    (candidateOrigin.hostname === 'localhost' || candidateOrigin.hostname === '127.0.0.1')
  ) {
    return true;
  }

  return false;
}

function validateAndSanitizePayload(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }

  const { locations, sources, destinations, metrics, units } = body;

  if (!Array.isArray(locations)) {
    return { error: 'locations must be an array' };
  }

  if (locations.length < MIN_LOCATIONS || locations.length > MAX_LOCATIONS) {
    return {
      error: `locations must contain between ${MIN_LOCATIONS} and ${MAX_LOCATIONS} coordinate pairs`,
    };
  }

  for (const coord of locations) {
    if (!Array.isArray(coord) || coord.length !== 2) {
      return { error: 'Each location must be a [lon, lat] pair' };
    }
    const [lon, lat] = coord;
    if (
      typeof lon !== 'number' ||
      typeof lat !== 'number' ||
      !Number.isFinite(lon) ||
      !Number.isFinite(lat)
    ) {
      return { error: 'Coordinates must be finite numbers' };
    }
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      return { error: 'Coordinates are out of valid geographic bounds' };
    }
  }

  const sanitized = { locations };

  if (sources !== undefined) {
    if (
      !Array.isArray(sources) ||
      sources.length === 0 ||
      sources.length > locations.length ||
      !sources.every((idx) => Number.isInteger(idx) && idx >= 0 && idx < locations.length)
    ) {
      return { error: 'sources must be a non-empty array of valid location indices' };
    }
    sanitized.sources = sources;
  }

  if (destinations !== undefined) {
    if (
      !Array.isArray(destinations) ||
      destinations.length === 0 ||
      destinations.length > locations.length ||
      !destinations.every((idx) => Number.isInteger(idx) && idx >= 0 && idx < locations.length)
    ) {
      return { error: 'destinations must be a non-empty array of valid location indices' };
    }
    sanitized.destinations = destinations;
  }

  if (metrics !== undefined) {
    if (
      !Array.isArray(metrics) ||
      metrics.length === 0 ||
      metrics.length > ALLOWED_METRICS.size ||
      !metrics.every((m) => typeof m === 'string' && ALLOWED_METRICS.has(m))
    ) {
      return { error: 'metrics must be a non-empty array of supported metrics' };
    }
    sanitized.metrics = metrics;
  }

  if (units !== undefined) {
    if (typeof units !== 'string' || !ALLOWED_UNITS.has(units)) {
      return { error: 'units must be one of m, km, or mi' };
    }
    sanitized.units = units;
  }

  return { payload: sanitized };
}

export async function POST({ request, locals }) {
  const isProduction = Boolean(locals?.runtime);
  const origin = request.headers?.get('origin');
  const referer = request.headers?.get('referer');

  if (!isAllowedOrigin(origin, referer, isProduction)) {
    return jsonResponse({ message: 'Forbidden' }, 403);
  }

  // In Astro's Cloudflare adapter:
  // 1. locals.runtime.env contains runtime secrets/vars on Cloudflare
  // 2. import.meta.env contains variables from .env during local development
  const apiKey = locals?.runtime?.env?.ORS_API_KEY || import.meta.env.ORS_API_KEY;

  if (!apiKey) {
    console.error('ORS_API_KEY is missing from environment');
    return jsonResponse({ message: 'Service configuration error' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ message: 'Invalid JSON body' }, 400);
  }

  const { payload, error } = validateAndSanitizePayload(body);
  if (error) {
    return jsonResponse({ message: error }, 400);
  }

  try {
    const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('ORS API error response:', response.status);
    }

    return jsonResponse(data, response.status);
  } catch (e) {
    console.error('Error in matrix proxy:', e);
    return jsonResponse({ message: 'Failed to calculate route matrix' }, 502);
  }
}
