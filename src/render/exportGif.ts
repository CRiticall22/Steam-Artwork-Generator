import GIF from 'gif.js';
import gifWorkerUrl from 'gif.js/dist/gif.worker.js?url';
import { loadImage, renderFrame } from './canvasRenderer';
import type { LayerStack } from '../types/layers';
import type { AssetOverrides, AssetSpec } from '../types/asset';

const FRAME_COUNT = 30;

function cycleDurationSec(layers: LayerStack): number {
  const durations: number[] = [layers.glow.enabled ? layers.glow.animationSpeedSec : 0];
  if (layers.gradientOverlay.enabled && layers.gradientOverlay.animated) {
    durations.push(layers.gradientOverlay.animationSpeedSec);
  }
  return Math.max(1, ...durations);
}

export async function renderGifBlob(
  layers: LayerStack,
  spec: AssetSpec,
  backgroundUrl: string | null,
  overrides: AssetOverrides | undefined,
  onProgress?: (fraction: number) => void,
): Promise<Blob> {
  const backgroundImage = backgroundUrl ? await loadImage(backgroundUrl) : null;
  const duration = cycleDurationSec(layers);
  const delayMs = (duration * 1000) / FRAME_COUNT;

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: spec.width,
    height: spec.height,
    workerScript: gifWorkerUrl,
    repeat: 0,
    // GIF has no real alpha channel — the transparent Logo slot is
    // flattened onto a solid backing color for the looped export rather
    // than pretending partial transparency (blur/glow edges) survives a
    // format that only supports binary transparency.
    background: spec.transparent ? '#000000' : undefined,
  });

  for (let i = 0; i < FRAME_COUNT; i++) {
    const t = (i / FRAME_COUNT) * duration;
    const frame = renderFrame(layers, {
      width: spec.width,
      height: spec.height,
      t,
      backgroundImage,
      transparent: false,
      fontScale: overrides?.neonTextFontScale,
      alignOverride: overrides?.neonTextAlign,
    });
    gif.addFrame(frame, { delay: delayMs, copy: true });
    onProgress?.((i + 1) / FRAME_COUNT);
  }

  return new Promise((resolve, reject) => {
    gif.on('finished', (blob) => resolve(blob));
    gif.on('abort', () => reject(new Error('GIF export was aborted.')));
    gif.render();
  });
}
