import { useState } from 'react';
import { Alert, Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { ASSET_SPECS, ASSET_TYPE_ORDER } from '../types/asset';
import type { AssetTypeId } from '../types/asset';
import { useProjectStore } from '../store/useProjectStore';
import { downloadBlob, renderPngBlob } from '../render/exportPng';
import { resolveBackgroundUrl } from '../data/background';

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'artwork'
  );
}

export function ExportBar() {
  const layers = useProjectStore((s) => s.layers);
  const selectedGame = useProjectStore((s) => s.selectedGame);
  const activeAssetType = useProjectStore((s) => s.activeAssetType);
  const assetOverrides = useProjectStore((s) => s.assetOverrides);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const baseName = slug(selectedGame?.name ?? layers.neonText.text ?? 'artwork');

  async function exportOnePng(assetType: AssetTypeId) {
    const spec = ASSET_SPECS[assetType];
    const backgroundUrl = resolveBackgroundUrl(layers, selectedGame, assetType);
    const blob = await renderPngBlob(layers, spec, backgroundUrl, assetOverrides[assetType]);
    downloadBlob(blob, `${baseName}-${slug(spec.label)}.png`);
  }

  async function handleExportCurrentPng() {
    setError(null);
    setBusy(true);
    try {
      await exportOnePng(activeAssetType);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleExportAllPng() {
    setError(null);
    setBusy(true);
    try {
      for (let i = 0; i < ASSET_TYPE_ORDER.length; i++) {
        await exportOnePng(ASSET_TYPE_ORDER[i]);
        setProgress((i + 1) / ASSET_TYPE_ORDER.length);
        // Small gap between downloads — most browsers throttle or prompt
        // when a page triggers several downloads back-to-back.
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  async function handleExportGif() {
    setError(null);
    setBusy(true);
    setProgress(0);
    try {
      // Loaded on demand — GIF encoding isn't needed until export is
      // actually requested, so it doesn't weigh down the initial load.
      const { renderGifBlob } = await import('../render/exportGif');
      const spec = ASSET_SPECS[activeAssetType];
      const backgroundUrl = resolveBackgroundUrl(layers, selectedGame, activeAssetType);
      const blob = await renderGifBlob(layers, spec, backgroundUrl, assetOverrides[activeAssetType], setProgress);
      downloadBlob(blob, `${baseName}-${slug(spec.label)}.gif`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        <Button variant="contained" onClick={handleExportCurrentPng} disabled={busy}>
          Export PNG ({ASSET_SPECS[activeAssetType].label})
        </Button>
        <Button variant="outlined" onClick={handleExportAllPng} disabled={busy}>
          Export all 5 PNGs
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleExportGif} disabled={busy}>
          Export GIF ({ASSET_SPECS[activeAssetType].label})
        </Button>
      </Stack>
      {busy && (
        <Box>
          <LinearProgress variant={progress > 0 ? 'determinate' : 'indeterminate'} value={progress * 100} />
          <Typography variant="caption" color="text.secondary">
            rendering…
          </Typography>
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}
