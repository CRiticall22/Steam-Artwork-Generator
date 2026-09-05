import { loadImage, renderFrame } from './canvasRenderer';
import type { LayerStack } from '../types/layers';
import type { AssetOverrides, AssetSpec } from '../types/asset';

export async function renderPngBlob(
  layers: LayerStack,
  spec: AssetSpec,
  backgroundUrl: string | null,
  overrides?: AssetOverrides,
): Promise<Blob> {
  const backgroundImage = backgroundUrl ? await loadImage(backgroundUrl) : null;

  const canvas = renderFrame(layers, {
    width: spec.width,
    height: spec.height,
    t: 0,
    backgroundImage,
    transparent: spec.transparent,
    fontScale: overrides?.neonTextFontScale,
    alignOverride: overrides?.neonTextAlign,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas PNG export failed — toBlob returned null.'));
    }, 'image/png');
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
