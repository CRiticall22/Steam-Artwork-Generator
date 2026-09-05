import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_HOST = 'cdn.cloudflare.steamstatic.com';

/**
 * Re-serves a Steam CDN image with `Access-Control-Allow-Origin: *`.
 * Steam's CDN sends no CORS headers of its own, so drawing one of its
 * images straight into a canvas taints it — `toBlob`/`toDataURL` then
 * throw the moment export tries to read pixels back out. Locked to
 * Steam's own CDN host so this isn't a general open image proxy.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.url;
  const target = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (!target) {
    res.status(400).json({ error: 'Missing required query param: url' });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    res.status(400).json({ error: 'Malformed url param' });
    return;
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    res.status(400).json({ error: `Refusing to proxy host: ${parsed.hostname}` });
    return;
  }

  try {
    const upstream = await fetch(parsed.toString());
    if (!upstream.ok || !upstream.body) {
      res.status(upstream.status).json({ error: `Upstream image fetch failed with status ${upstream.status}` });
      return;
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.status(200).send(buffer);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Steam CDN', detail: (err as Error).message });
  }
}
