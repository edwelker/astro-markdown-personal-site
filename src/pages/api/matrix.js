export const prerender = false;

export async function POST({ request, locals }) {
  console.log('API Matrix endpoint hit');

  // In Astro's Cloudflare adapter:
  // 1. locals.runtime.env contains runtime secrets/vars on Cloudflare
  // 2. import.meta.env contains variables from .env during local development
  const apiKey = locals?.runtime?.env?.ORS_API_KEY || import.meta.env.ORS_API_KEY;

  if (!apiKey) {
    console.error('ORS_API_KEY is missing from environment');
    return new Response(
      JSON.stringify({
        message: 'ORS_API_KEY not found in environment',
        context: locals?.runtime ? 'production' : 'development',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await request.json();
    console.log('Request body received, locations count:', body.locations?.length);

    console.log('Forwarding request to OpenRouteService...');
    const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
    });

    console.log('ORS API response status:', response.status);
    const data = await response.json();

    if (!response.ok) {
      console.error('ORS API error response:', data);
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in matrix proxy:', e);
    return new Response(JSON.stringify({ message: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
