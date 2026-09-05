/**
 * The layer-stack model — the single source of truth for an artwork's
 * look. Both the DOM/CSS live preview and the Canvas2D export renderer
 * read these exact same types, so a layer's params never drift between
 * "what you see while editing" and "what gets exported".
 *
 * The stack is a fixed set of six layer kinds rather than a free-form
 * reorderable list: it keeps the UI and both renderers simple, and every
 * kind already has a fixed, sensible place in the composite (background
 * at the bottom, vignette on top).
 */

/** CSS `mix-blend-mode` values. Canvas2D's `globalCompositeOperation`
 * accepts the identical set of blend-mode strings, so this one union
 * drives both renderers. */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export const BLEND_MODES: BlendMode[] = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
];

export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function rgbaToCss({ r, g, b, a }: RGBA): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export interface BackgroundImageLayer {
  kind: 'backgroundImage';
  enabled: boolean;
  /** Proxied Steam CDN URL (via /api/image-proxy) or a user-uploaded data URL. */
  imageUrl: string | null;
  fit: 'cover' | 'contain' | 'stretch';
  opacity: number; // 0-1
}

export interface GradientOverlayLayer {
  kind: 'gradientOverlay';
  enabled: boolean;
  colorA: RGBA;
  colorB: RGBA;
  /** Gradient angle in degrees, 0-360. */
  angle: number;
  blendMode: BlendMode;
  opacity: number; // 0-1
  /** When true, the angle sweeps a full rotation over `animationSpeedSec`,
   * reproducing the original tool's moving-light-sweep feel. */
  animated: boolean;
  animationSpeedSec: number;
}

export interface NeonTextLayer {
  kind: 'neonText';
  enabled: boolean;
  text: string;
  fontFamily: string;
  fontWeight: number;
  /** Font size in px, relative to a 1280x720 reference canvas; scaled
   * proportionally for every other asset size at render time. */
  fontSize: number;
  color: string; // hex
  align: AlignItems;
  letterSpacing: number; // px, at reference scale
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  /** Blend mode of the blurred ghost copy behind the crisp text, matching
   * the original's `::before` treatment. */
  ghostBlendMode: BlendMode;
  ghostBlurPx: number;
}

export interface GlowLayer {
  kind: 'glow';
  enabled: boolean;
  color: string; // hex
  blurRadius: number; // px, at reference scale
  intensity: number; // 0-1
  animationSpeedSec: number; // pulse cycle duration
}

export interface GrainLayer {
  kind: 'grain';
  enabled: boolean;
  intensity: number; // 0-1
  cellSize: number; // px, noise tile granularity
  monochrome: boolean;
  blendMode: BlendMode;
}

export interface VignetteLayer {
  kind: 'vignette';
  enabled: boolean;
  color: string; // hex
  strength: number; // 0-1, opacity at the very edge
  spread: number; // 0-1, how far from center the darkening starts
}

/** Fixed render order: array position 0 is drawn first (bottom). */
export interface LayerStack {
  backgroundImage: BackgroundImageLayer;
  gradientOverlay: GradientOverlayLayer;
  glow: GlowLayer;
  neonText: NeonTextLayer;
  grain: GrainLayer;
  vignette: VignetteLayer;
}

export const LAYER_RENDER_ORDER: (keyof LayerStack)[] = [
  'backgroundImage',
  'gradientOverlay',
  'glow',
  'neonText',
  'grain',
  'vignette',
];
