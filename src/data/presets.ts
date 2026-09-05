import type { LayerStack } from '../types/layers';

export function createDefaultLayerStack(): LayerStack {
  return {
    backgroundImage: {
      kind: 'backgroundImage',
      enabled: true,
      imageUrl: null,
      fit: 'cover',
      opacity: 1,
    },
    gradientOverlay: {
      kind: 'gradientOverlay',
      enabled: true,
      colorA: { r: 153, g: 36, b: 161, a: 1 },
      colorB: { r: 4, g: 81, b: 214, a: 1 },
      angle: 114,
      blendMode: 'multiply',
      opacity: 1,
      animated: false,
      animationSpeedSec: 6,
    },
    glow: {
      kind: 'glow',
      enabled: true,
      color: '#ffffff',
      blurRadius: 24,
      intensity: 0.8,
      animationSpeedSec: 3,
    },
    neonText: {
      kind: 'neonText',
      enabled: true,
      text: 'TITLE',
      fontFamily: 'SF Pro Display',
      fontWeight: 900,
      fontSize: 100,
      color: '#ffffff',
      align: 'center',
      letterSpacing: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
      ghostBlendMode: 'difference',
      ghostBlurPx: 3,
    },
    grain: {
      kind: 'grain',
      enabled: false,
      intensity: 0.08,
      cellSize: 2,
      monochrome: true,
      blendMode: 'overlay',
    },
    vignette: {
      kind: 'vignette',
      enabled: false,
      color: '#000000',
      strength: 0.5,
      spread: 0.6,
    },
  };
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  layers: LayerStack;
}

function preset(id: string, name: string, description: string, overrides: (base: LayerStack) => LayerStack): Preset {
  return { id, name, description, layers: overrides(createDefaultLayerStack()) };
}

/** Seed presets shipped with the app, so it never opens to a blank slate.
 * "Neon Classic" recreates the original tool's one hardcoded look; the
 * rest are new. */
export const SEED_PRESETS: Preset[] = [
  preset('neon-classic', 'Neon Classic', 'The original glow + gradient look, generalized into the new layer stack.', (base) => base),
  preset('vaporwave', 'Vaporwave', 'Hot pink into cyan, screen blend, loud magenta glow.', (base) => ({
    ...base,
    gradientOverlay: {
      ...base.gradientOverlay,
      colorA: { r: 255, g: 42, b: 191, a: 1 },
      colorB: { r: 34, g: 221, b: 255, a: 1 },
      angle: 45,
      blendMode: 'screen',
      animated: true,
      animationSpeedSec: 8,
    },
    glow: { ...base.glow, color: '#ff2abf', blurRadius: 36, intensity: 1 },
    grain: { ...base.grain, enabled: true, intensity: 0.06 },
  })),
  preset('retro-chrome', 'Retro Chrome', 'Brushed-steel gradient, hard-light text, heavier grain.', (base) => ({
    ...base,
    gradientOverlay: {
      ...base.gradientOverlay,
      colorA: { r: 210, g: 214, b: 220, a: 1 },
      colorB: { r: 70, g: 78, b: 90, a: 1 },
      angle: 90,
      blendMode: 'hard-light',
    },
    neonText: { ...base.neonText, ghostBlendMode: 'overlay', color: '#f2f2f2' },
    glow: { ...base.glow, color: '#dfe6ee', blurRadius: 12, intensity: 0.4 },
    grain: { ...base.grain, enabled: true, intensity: 0.15, cellSize: 1 },
  })),
  preset('minimal-foil', 'Minimal Foil', 'Soft gold sheen, subtle glow, wide letter-spacing.', (base) => ({
    ...base,
    gradientOverlay: {
      ...base.gradientOverlay,
      colorA: { r: 226, g: 189, b: 116, a: 0.8 },
      colorB: { r: 250, g: 240, b: 210, a: 0.8 },
      angle: 135,
      blendMode: 'soft-light',
    },
    neonText: { ...base.neonText, letterSpacing: 6, ghostBlurPx: 1, color: '#fff8e8' },
    glow: { ...base.glow, color: '#f5e2b8', blurRadius: 8, intensity: 0.25 },
  })),
  preset('holo-grain', 'Holo Grain', 'Animated hue-shifting gradient with heavy grain and a strong vignette.', (base) => ({
    ...base,
    gradientOverlay: {
      ...base.gradientOverlay,
      colorA: { r: 120, g: 60, b: 255, a: 1 },
      colorB: { r: 0, g: 220, b: 200, a: 1 },
      blendMode: 'hue',
      animated: true,
      animationSpeedSec: 5,
    },
    grain: { ...base.grain, enabled: true, intensity: 0.22, monochrome: false },
    vignette: { ...base.vignette, enabled: true, strength: 0.65, spread: 0.45 },
  })),
];
