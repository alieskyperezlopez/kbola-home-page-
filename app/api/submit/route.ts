export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error('Make webhook error:', res.status, await res.text());
      return Response.json({ error: 'Failed to send data.' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Webhook fetch error:', err);
    return Response.json({ error: 'Failed to reach webhook.' }, { status: 500 });
  }
}
