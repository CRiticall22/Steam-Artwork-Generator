import type { AssetTypeId } from '../types/asset';
import { ASSET_SPECS } from '../types/asset';

/**
 * Steam's per-app CDN. These filenames are Steam's own documented library
 * asset naming convention (the same one Steam's client and store use) —
 * not a public API, so if Steam ever changes the pattern the fix is
 * isolated to this one file.
 */
const STEAM_CDN_BASE = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

export function steamCdnImageUrl(appid: number, assetType: AssetTypeId): string | null {
  const file = ASSET_SPECS[assetType].steamCdnFile;
  if (!file) return null;
  return `${STEAM_CDN_BASE}/${appid}/${file}`;
}

/** Routes a Steam CDN URL through our own CORS-safe proxy function so the
 * Canvas2D exporter can read pixels back out without tainting the canvas
 * (Steam's CDN sends no Access-Control-Allow-Origin header). */
export function proxiedImageUrl(sourceUrl: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(sourceUrl)}`;
}
