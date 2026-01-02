export const prerender = false;

export async function POST({ request }) {
  console.log("Local API Matrix endpoint hit");
  
  // Vite loads variables from .env into import.meta.env during development
  const apiKey = import.meta.env.ORS_API_KEY;

  if (!apiKey) {
    console.error("ORS_API_KEY is missing in .env");
    return new Response(JSON.stringify({ message: "ORS_API_KEY not set in .env" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    console.log("Request body received, locations count:", body.locations?.length);
    
    console.log("Forwarding request to OpenRouteService...");
    const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify(body)
    });

    console.log("ORS API response status:", response.status);
    const data = await response.json();
    
    if (!response.ok) {
      console.error("ORS API error response:", data);
    }
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error("Error in local matrix proxy:", e);
    return new Response(JSON.stringify({ message: e.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
