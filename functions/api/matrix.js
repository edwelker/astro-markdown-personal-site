export async function onRequestPost(context) {
  const { request, env } = context;

  // In native Cloudflare Pages Functions, env contains the environment variables
  const apiKey = env.ORS_API_KEY;

  if (!apiKey) {
    console.error('ORS_API_KEY not set in Cloudflare environment');
    return new Response(
      JSON.stringify({ message: 'ORS_API_KEY not set in Cloudflare environment' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouteService API error:', data);
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Cloudflare Function error:', e);
    return new Response(JSON.stringify({ message: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
