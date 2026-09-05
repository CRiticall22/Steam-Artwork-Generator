import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SteamSearchResult {
  appid: number;
  name: string;
}

interface SteamStoreSearchResponse {
  total?: number;
  items?: Array<{ id: number; name: string }>;
}

/**
 * Proxies Steam's `storesearch` endpoint (undocumented but stable and
 * widely relied on by community tooling) — the browser can't call it
 * directly because Steam sends no CORS headers on it.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const term = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!term) {
    res.status(400).json({ error: 'Missing required query param: q' });
    return;
  }

  const upstreamUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&cc=us&l=en`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { 'User-Agent': 'steam-artwork-generator/1.0' },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Steam search failed with status ${upstream.status}` });
      return;
    }

    const data = (await upstream.json()) as SteamStoreSearchResponse;
    const results: SteamSearchResult[] = (data.items ?? []).map((item) => ({
      appid: item.id,
      name: item.name,
    }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ results });
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Steam search API', detail: (err as Error).message });
  }
}
