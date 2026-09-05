import type { LayerStack } from '../types/layers';
import type { AssetTypeId, SelectedGame } from '../types/asset';

/**
 * A user-uploaded image (layers.backgroundImage.imageUrl) always wins over
 * the Steam-sourced art for the selected game — uploading is an explicit
 * override. Falls back to the proxied Steam CDN URL for the active asset
 * type, or null if neither is set.
 */
export function resolveBackgroundUrl(
  layers: LayerStack,
  selectedGame: SelectedGame | null,
  assetType: AssetTypeId,
): string | null {
  if (layers.backgroundImage.imageUrl) return layers.backgroundImage.imageUrl;
  return selectedGame?.proxiedImageUrls[assetType] ?? null;
}
