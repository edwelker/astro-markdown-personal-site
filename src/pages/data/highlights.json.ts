import { highlights } from '../../data/highlights';

export async function GET() {
  return new Response(JSON.stringify(highlights), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
