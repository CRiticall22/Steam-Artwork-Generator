import type { LayerStack } from './layers';

/** The five artwork slots Steam's library actually uses. */
export type AssetTypeId =
  | 'libraryCapsule'
  | 'libraryHeader'
  | 'libraryHero'
  | 'smallCapsule'
  | 'logo';

export interface AssetSpec {
  id: AssetTypeId;
  label: string;
  width: number;
  height: number;
  /** Whether the exported PNG should carry an alpha channel instead of a
   * background fill. Only the logo slot is transparent. */
  transparent: boolean;
  /** Filename Steam uses on its CDN for this slot, under
   * `https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/`.
   * `null` means this slot has no direct Steam-hosted equivalent to pull
   * as a background (the logo starts blank). */
  steamCdnFile: string | null;
}

export const ASSET_SPECS: Record<AssetTypeId, AssetSpec> = {
  libraryCapsule: {
    id: 'libraryCapsule',
    label: 'Library Capsule',
    width: 600,
    height: 900,
    transparent: false,
    steamCdnFile: 'library_600x900.jpg',
  },
  libraryHeader: {
    id: 'libraryHeader',
    label: 'Library Header',
    width: 460,
    height: 215,
    transparent: false,
    steamCdnFile: 'header.jpg',
  },
  libraryHero: {
    id: 'libraryHero',
    label: 'Library Hero',
    width: 3840,
    height: 1240,
    transparent: false,
    steamCdnFile: 'library_hero.jpg',
  },
  smallCapsule: {
    id: 'smallCapsule',
    label: 'Small Capsule',
    width: 231,
    height: 87,
    transparent: false,
    steamCdnFile: 'capsule_231x87.jpg',
  },
  logo: {
    id: 'logo',
    label: 'Logo',
    width: 1280,
    height: 720,
    transparent: true,
    steamCdnFile: null,
  },
};

export const ASSET_TYPE_ORDER: AssetTypeId[] = [
  'libraryCapsule',
  'libraryHeader',
  'libraryHero',
  'smallCapsule',
  'logo',
];

/** Per-asset-type overrides layered on top of the project's shared style —
 * used for the handful of params that genuinely need to differ per size
 * (mainly logo text placement/scale, since a 3840-wide hero and a
 * 231-wide capsule can't share one absolute font size sensibly). */
export type AssetOverrides = Partial<{
  neonTextFontScale: number; // multiplier applied on top of NeonTextLayer.fontSize
  neonTextAlign: LayerStack['neonText']['align'];
}>;

export interface SteamGameResult {
  appid: number;
  name: string;
}

export interface SelectedGame extends SteamGameResult {
  /** Proxied (CORS-safe) URLs, keyed by asset type, once resolved. */
  proxiedImageUrls: Partial<Record<AssetTypeId, string>>;
}
