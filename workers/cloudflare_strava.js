export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Handle Strava Webhook Validation (GET)
    // This is required for the initial handshake and periodic checks.
    if (request.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === env.STRAVA_VERIFY_TOKEN) {
        return new Response(JSON.stringify({ 'hub.challenge': challenge }), {
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response('Forbidden', { status: 403 });
    }

    // 2. Handle Strava Activity Notification (POST)
    if (request.method === 'POST') {
      try {
        const data = await request.json();

        // aspect_type 'create' ensures we only trigger for NEW rides, not edits
        if (data.object_type === 'activity' && data.aspect_type === 'create') {
          // Fire both the build and discord notification at the same time
          const buildTask = fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });

          const discordTask = fetch(env.DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'Strava Bot',
              avatar_url: 'https://strava.com/favicon.ico',
              content: `🚴 **New ride uploaded!**\nWebsite rebuild triggered for activity ID: \`${data.object_id}\`.\nCheck it out here: https://www.strava.com/activities/${data.object_id}`,
            }),
          });

          // Wait for both tasks to settle before finishing
          await Promise.allSettled([buildTask, discordTask]);
        }

        return new Response('EVENT_RECEIVED', { status: 200 });
      } catch (err) {
        return new Response('Invalid JSON', { status: 400 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
