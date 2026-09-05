import type { SteamGameResult } from '../types/asset';

export async function searchSteamGames(query: string, signal?: AbortSignal): Promise<SteamGameResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal });
  if (!res.ok) {
    throw new Error(`Steam search failed: ${res.status}`);
  }
  const data = (await res.json()) as { results: SteamGameResult[] };
  return data.results;
}
