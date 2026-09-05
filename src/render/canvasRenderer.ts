import type { LayerStack, NeonTextLayer } from '../types/layers';
import { LAYER_RENDER_ORDER } from '../types/layers';
import type { AlignItems } from '../types/layers';

/** Reference canvas every "relative" size in a layer (font size, letter
 * spacing, blur radii, etc.) is authored against. Every actual export
 * target scales from this by its own height. */
export const REFERENCE_HEIGHT = 720;

/** Text/glow sizing scale shared by both renderers: proportional to the
 * target asset's height against the 1280x720 reference, times whatever
 * per-asset-type font-scale override is set. */
export function computeTextScale(height: number, fontScaleOverride?: number): number {
  return (height / REFERENCE_HEIGHT) * (fontScaleOverride ?? 1);
}

export interface RenderOptions {
  width: number;
  height: number;
  /** Animation time in seconds, used by animated layers (gradient sweep,
   * glow pulse). Pass 0 for a static render. */
  t: number;
  /** Loaded background image for this asset, already proxied/CORS-safe.
   * `null` renders no background layer regardless of the layer's
   * `enabled` flag. */
  backgroundImage: HTMLImageElement | null;
  /** Multiplies neonText.fontSize/letterSpacing for this specific asset
   * size, from the project's per-asset-type overrides. */
  fontScale?: number;
  alignOverride?: AlignItems;
  /** True for the transparent Logo slot: skips filling an opaque
   * background before layers are drawn, so uncovered pixels stay alpha 0. */
  transparent: boolean;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function resetContext(ctx: CanvasRenderingContext2D) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  layer: LayerStack['backgroundImage'],
  img: HTMLImageElement,
  width: number,
  height: number,
) {
  resetContext(ctx);
  ctx.globalAlpha = layer.opacity;

  const canvasRatio = width / height;
  const imgRatio = img.naturalWidth / img.naturalHeight;
  let drawW = width;
  let drawH = height;
  let dx = 0;
  let dy = 0;

  if (layer.fit === 'stretch') {
    // full-bleed, no ratio preservation
  } else if (layer.fit === 'cover' ? imgRatio > canvasRatio : imgRatio < canvasRatio) {
    drawH = height;
    drawW = height * imgRatio;
    dx = (width - drawW) / 2;
  } else {
    drawW = width;
    drawH = width / imgRatio;
    dy = (height - drawH) / 2;
  }

  if (layer.fit === 'contain') {
    ctx.drawImage(img, dx, dy, drawW, drawH);
  } else {
    // cover / stretch both fill the full canvas; cover just crops via the
    // ratio math above producing a draw rect that overflows equally on
    // both sides when combined with a clip.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.restore();
  }
}

export function gradientAngleAtTime(layer: LayerStack['gradientOverlay'], t: number): number {
  if (!layer.animated) return layer.angle;
  const progress = (t / layer.animationSpeedSec) % 1;
  return (layer.angle + progress * 360) % 360;
}

function drawGradientOverlay(
  ctx: CanvasRenderingContext2D,
  layer: LayerStack['gradientOverlay'],
  width: number,
  height: number,
  t: number,
) {
  resetContext(ctx);
  ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
  ctx.globalAlpha = layer.opacity;

  const angleRad = (gradientAngleAtTime(layer, t) * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const len = Math.sqrt(width * width + height * height) / 2;
  const x0 = cx - Math.cos(angleRad) * len;
  const y0 = cy - Math.sin(angleRad) * len;
  const x1 = cx + Math.cos(angleRad) * len;
  const y1 = cy + Math.sin(angleRad) * len;

  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  const a = layer.colorA;
  const b = layer.colorB;
  gradient.addColorStop(0, `rgba(${a.r}, ${a.g}, ${a.b}, ${a.a})`);
  gradient.addColorStop(1, `rgba(${b.r}, ${b.g}, ${b.b}, ${b.a})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

interface TextLayout {
  x: number;
  y: number;
  fontPx: number;
  fontString: string;
  letterSpacingPx: number;
}

function layoutText(
  layer: NeonTextLayer,
  width: number,
  height: number,
  scale: number,
  alignOverride: AlignItems | undefined,
): TextLayout {
  const fontPx = layer.fontSize * scale;
  const align = alignOverride ?? layer.align;
  const fontString = `${layer.fontWeight} ${fontPx}px "${layer.fontFamily}", -apple-system, "Segoe UI", sans-serif`;

  let y: number;
  if (align === 'flex-start') {
    y = layer.paddingTop * scale + fontPx / 2;
  } else if (align === 'flex-end') {
    y = height - layer.paddingBottom * scale - fontPx / 2;
  } else {
    y = height / 2 + ((layer.paddingTop - layer.paddingBottom) * scale) / 2;
  }
  const x = width / 2 + ((layer.paddingLeft - layer.paddingRight) * scale) / 2;

  return { x, y, fontPx, fontString, letterSpacingPx: layer.letterSpacing * scale };
}

function applyLetterSpacing(ctx: CanvasRenderingContext2D, px: number) {
  // Experimental but shipped in Chromium; a graceful no-op elsewhere since
  // the text still renders correctly, just without spacing.
  const anyCtx = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ('letterSpacing' in ctx) {
    anyCtx.letterSpacing = `${px}px`;
  }
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  glow: LayerStack['glow'],
  text: NeonTextLayer,
  width: number,
  height: number,
  scale: number,
  alignOverride: AlignItems | undefined,
  t: number,
) {
  if (!text.enabled || !text.text) return;
  resetContext(ctx);

  const layout = layoutText(text, width, height, scale, alignOverride);
  ctx.font = layout.fontString;
  applyLetterSpacing(ctx, layout.letterSpacingPx);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const pulse = 0.75 + 0.25 * Math.sin((t / glow.animationSpeedSec) * Math.PI * 2);
  const passes = [
    { blur: glow.blurRadius * 0.5 * scale, alpha: glow.intensity * 0.5 * pulse },
    { blur: glow.blurRadius * 1.0 * scale, alpha: glow.intensity * 0.35 * pulse },
    { blur: glow.blurRadius * 1.8 * scale, alpha: glow.intensity * 0.2 * pulse },
  ];

  for (const pass of passes) {
    ctx.shadowColor = glow.color;
    ctx.shadowBlur = pass.blur;
    ctx.fillStyle = glow.color;
    ctx.globalAlpha = pass.alpha;
    ctx.fillText(text.text, layout.x, layout.y);
  }
  ctx.shadowBlur = 0;
}

function drawNeonText(
  ctx: CanvasRenderingContext2D,
  text: NeonTextLayer,
  width: number,
  height: number,
  scale: number,
  alignOverride: AlignItems | undefined,
) {
  if (!text.text) return;
  resetContext(ctx);

  const layout = layoutText(text, width, height, scale, alignOverride);
  ctx.font = layout.fontString;
  applyLetterSpacing(ctx, layout.letterSpacingPx);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Blurred ghost copy, matching the original's `::before` treatment.
  ctx.save();
  ctx.globalCompositeOperation = text.ghostBlendMode as GlobalCompositeOperation;
  ctx.filter = `blur(${text.ghostBlurPx * scale}px)`;
  ctx.fillStyle = text.color;
  ctx.fillText(text.text, layout.x, layout.y);
  ctx.restore();

  // Crisp text on top.
  resetContext(ctx);
  ctx.font = layout.fontString;
  applyLetterSpacing(ctx, layout.letterSpacingPx);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = text.color;
  ctx.fillText(text.text, layout.x, layout.y);
}

const noiseTileCache = new Map<string, HTMLCanvasElement>();

function getNoiseTile(cellSize: number, monochrome: boolean): HTMLCanvasElement {
  const key = `${cellSize}:${monochrome}`;
  const cached = noiseTileCache.get(key);
  if (cached) return cached;

  const size = 128;
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext('2d')!;
  const cells = Math.ceil(size / cellSize);
  const imageData = tctx.createImageData(size, size);

  for (let cy = 0; cy < cells; cy++) {
    for (let cx = 0; cx < cells; cx++) {
      const r = Math.random() * 255;
      const g = monochrome ? r : Math.random() * 255;
      const b = monochrome ? r : Math.random() * 255;
      for (let py = 0; py < cellSize; py++) {
        for (let px = 0; px < cellSize; px++) {
          const x = cx * cellSize + px;
          const y = cy * cellSize + py;
          if (x >= size || y >= size) continue;
          const i = (y * size + x) * 4;
          imageData.data[i] = r;
          imageData.data[i + 1] = g;
          imageData.data[i + 2] = b;
          imageData.data[i + 3] = 255;
        }
      }
    }
  }
  tctx.putImageData(imageData, 0, 0);
  noiseTileCache.set(key, tile);
  return tile;
}

/** Exposes the same noise tile the Canvas2D grain pass uses, as a data URL,
 * so the DOM live preview's grain layer is pixel-sourced from the identical
 * generator instead of a second, hand-tuned CSS approximation. */
export function getNoiseTileDataUrl(cellSize: number, monochrome: boolean): string {
  return getNoiseTile(cellSize, monochrome).toDataURL();
}

function drawGrain(ctx: CanvasRenderingContext2D, layer: LayerStack['grain'], width: number, height: number) {
  resetContext(ctx);
  ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
  ctx.globalAlpha = layer.intensity;

  const tile = getNoiseTile(layer.cellSize, layer.monochrome);
  const pattern = ctx.createPattern(tile, 'repeat');
  if (!pattern) return;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, width, height);
}

function drawVignette(ctx: CanvasRenderingContext2D, layer: LayerStack['vignette'], width: number, height: number) {
  resetContext(ctx);
  ctx.globalCompositeOperation = 'multiply';

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.sqrt(cx * cx + cy * cy);
  const innerRadius = outerRadius * layer.spread;

  const { r, g, b } = hexToRgb(layer.color);
  const gradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${layer.strength})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Pure render: identical layer params + `t` always produce the identical
 * canvas. PNG export calls this once; GIF export calls it once per frame.
 */
export function renderFrame(layers: LayerStack, opts: RenderOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = opts.width;
  canvas.height = opts.height;
  const ctx = canvas.getContext('2d', { alpha: opts.transparent })!;

  if (!opts.transparent) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, opts.width, opts.height);
  }

  const scale = computeTextScale(opts.height, opts.fontScale);

  for (const kind of LAYER_RENDER_ORDER) {
    const layer = layers[kind];
    if (!layer.enabled) continue;

    switch (layer.kind) {
      case 'backgroundImage':
        if (opts.backgroundImage) drawBackgroundImage(ctx, layer, opts.backgroundImage, opts.width, opts.height);
        break;
      case 'gradientOverlay':
        drawGradientOverlay(ctx, layer, opts.width, opts.height, opts.t);
        break;
      case 'glow':
        drawGlow(ctx, layer, layers.neonText, opts.width, opts.height, scale, opts.alignOverride, opts.t);
        break;
      case 'neonText':
        drawNeonText(ctx, layer, opts.width, opts.height, scale, opts.alignOverride);
        break;
      case 'grain':
        drawGrain(ctx, layer, opts.width, opts.height);
        break;
      case 'vignette':
        drawVignette(ctx, layer, opts.width, opts.height);
        break;
    }
  }

  resetContext(ctx);
  return canvas;
}

/** Loads an image (already routed through our CORS-safe proxy) for use
 * with the Canvas2D renderer. Rejects on load failure rather than
 * resolving with a broken image, so callers can surface a real error. */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
