import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { LayerStack } from '../types/layers';
import type { AlignItems } from '../types/layers';
import { rgbaToCss } from '../types/layers';
import { computeTextScale, getNoiseTileDataUrl, hexToRgb } from './canvasRenderer';

export interface LivePreviewProps {
  layers: LayerStack;
  width: number;
  height: number;
  transparent: boolean;
  /** Same proxied URL used for export, so what's on screen while editing
   * is drawn from the identical source the exporter will read. */
  backgroundUrl: string | null;
  fontScale?: number;
  alignOverride?: AlignItems;
  /** The live preview is shrunk to fit this box (px) while every child is
   * laid out at the asset's true resolution, via a single CSS `scale` on
   * the content wrapper — so font sizes, padding, and blur radii are
   * pixel-identical to what the Canvas2D exporter produces, just visually
   * smaller on screen. */
  maxPreviewWidth?: number;
}

const objectFitFor: Record<LayerStack['backgroundImage']['fit'], CSSProperties['objectFit']> = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'fill',
};

export function LivePreview({
  layers,
  width,
  height,
  transparent,
  backgroundUrl,
  fontScale,
  alignOverride,
  maxPreviewWidth = 460,
}: LivePreviewProps) {
  const previewScale = Math.min(1, maxPreviewWidth / width);
  const scale = computeTextScale(height, fontScale);
  const align = alignOverride ?? layers.neonText.align;

  const grainTileUrl = useMemo(
    () => (layers.grain.enabled ? getNoiseTileDataUrl(layers.grain.cellSize, layers.grain.monochrome) : null),
    [layers.grain.enabled, layers.grain.cellSize, layers.grain.monochrome],
  );

  const vignetteRgb = useMemo(() => hexToRgb(layers.vignette.color), [layers.vignette.color]);
  const glowRgb = useMemo(() => hexToRgb(layers.glow.color), [layers.glow.color]);

  return (
    <div
      style={{
        width: width * previewScale,
        height: height * previewScale,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: transparent ? undefined : '#000',
        backgroundImage: transparent
          ? 'repeating-conic-gradient(#2a2f3a 0% 25%, #12151b 0% 50%)'
          : undefined,
        backgroundSize: transparent ? '20px 20px' : undefined,
      }}
    >
      <div
        style={{
          width,
          height,
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `scale(${previewScale})`,
          transformOrigin: 'top left',
        }}
      >
        {layers.backgroundImage.enabled && backgroundUrl && (
          <img
            src={backgroundUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: objectFitFor[layers.backgroundImage.fit],
              opacity: layers.backgroundImage.opacity,
            }}
          />
        )}

        {layers.gradientOverlay.enabled && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                top: '-75%',
                left: '-75%',
                width: '250%',
                height: '250%',
                background: `linear-gradient(${layers.gradientOverlay.angle}deg, ${rgbaToCss(
                  layers.gradientOverlay.colorA,
                )} 5%, ${rgbaToCss(layers.gradientOverlay.colorB)} 95%)`,
                mixBlendMode: layers.gradientOverlay.blendMode,
                opacity: layers.gradientOverlay.opacity,
                animation: layers.gradientOverlay.animated
                  ? `gradient-spin ${layers.gradientOverlay.animationSpeedSec}s linear infinite`
                  : undefined,
              }}
            />
          </div>
        )}

        {layers.glow.enabled && layers.neonText.enabled && layers.neonText.text && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: align,
              justifyContent: 'center',
              padding: `${layers.neonText.paddingTop * scale}px ${layers.neonText.paddingRight * scale}px ${
                layers.neonText.paddingBottom * scale
              }px ${layers.neonText.paddingLeft * scale}px`,
              animation: `glow-pulse ${layers.glow.animationSpeedSec}s ease-in-out infinite`,
            }}
          >
            <span
              style={{
                fontFamily: layers.neonText.fontFamily,
                fontWeight: layers.neonText.fontWeight,
                fontSize: layers.neonText.fontSize * scale,
                letterSpacing: layers.neonText.letterSpacing * scale,
                color: layers.glow.color,
                textShadow: [
                  `0 0 ${layers.glow.blurRadius * 0.5 * scale}px ${rgbaToCss({ ...glowRgb, a: layers.glow.intensity })}`,
                  `0 0 ${layers.glow.blurRadius * 1.0 * scale}px ${rgbaToCss({ ...glowRgb, a: layers.glow.intensity * 0.7 })}`,
                  `0 0 ${layers.glow.blurRadius * 1.8 * scale}px ${rgbaToCss({ ...glowRgb, a: layers.glow.intensity * 0.4 })}`,
                ].join(', '),
              }}
            >
              {layers.neonText.text}
            </span>
          </div>
        )}

        {layers.neonText.enabled && layers.neonText.text && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: align,
              justifyContent: 'center',
              padding: `${layers.neonText.paddingTop * scale}px ${layers.neonText.paddingRight * scale}px ${
                layers.neonText.paddingBottom * scale
              }px ${layers.neonText.paddingLeft * scale}px`,
            }}
          >
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  fontFamily: layers.neonText.fontFamily,
                  fontWeight: layers.neonText.fontWeight,
                  fontSize: layers.neonText.fontSize * scale,
                  letterSpacing: layers.neonText.letterSpacing * scale,
                  color: layers.neonText.color,
                  mixBlendMode: layers.neonText.ghostBlendMode,
                  filter: `blur(${layers.neonText.ghostBlurPx * scale}px)`,
                }}
              >
                {layers.neonText.text}
              </span>
              <span
                style={{
                  fontFamily: layers.neonText.fontFamily,
                  fontWeight: layers.neonText.fontWeight,
                  fontSize: layers.neonText.fontSize * scale,
                  letterSpacing: layers.neonText.letterSpacing * scale,
                  color: layers.neonText.color,
                }}
              >
                {layers.neonText.text}
              </span>
            </span>
          </div>
        )}

        {layers.grain.enabled && grainTileUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${grainTileUrl})`,
              backgroundRepeat: 'repeat',
              mixBlendMode: layers.grain.blendMode,
              opacity: layers.grain.intensity,
            }}
          />
        )}

        {layers.vignette.enabled && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle, ${rgbaToCss({ ...vignetteRgb, a: 0 })} ${
                layers.vignette.spread * 100
              }%, ${rgbaToCss({ ...vignetteRgb, a: layers.vignette.strength })} 100%)`,
              mixBlendMode: 'multiply',
            }}
          />
        )}
      </div>
    </div>
  );
}
