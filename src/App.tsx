import { useMemo } from 'react';
import {
  AppBar,
  Box,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useProjectStore } from './store/useProjectStore';
import { ASSET_SPECS } from './types/asset';
import { GamePicker } from './components/GamePicker';
import { PresetBar } from './components/PresetBar';
import { AssetTypeTabs } from './components/AssetTypeTabs';
import { ExportBar } from './components/ExportBar';
import { LivePreview } from './render/domLayers';
import { resolveBackgroundUrl } from './data/background';
import {
  BackgroundImagePanel,
  GlowPanel,
  GradientOverlayPanel,
  GrainPanel,
  NeonTextPanel,
  VignettePanel,
} from './components/LayerControls';
import type { AlignItems } from './types/layers';

const ALIGN_OVERRIDE_OPTIONS: AlignItems[] = ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function AssetOverridePanel() {
  const activeAssetType = useProjectStore((s) => s.activeAssetType);
  const assetOverrides = useProjectStore((s) => s.assetOverrides);
  const setAssetOverride = useProjectStore((s) => s.setAssetOverride);
  const defaultAlign = useProjectStore((s) => s.layers.neonText.align);

  const current = assetOverrides[activeAssetType] ?? {};
  const fontScale = current.neonTextFontScale ?? 1;
  const align = current.neonTextAlign ?? defaultAlign;

  return (
    <Stack spacing={2} sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="subtitle2">
        {ASSET_SPECS[activeAssetType].label} overrides
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Logo text placement and scale often need to differ per asset size — these apply only to{' '}
        {ASSET_SPECS[activeAssetType].label}, on top of the shared style.
      </Typography>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Text scale: {fontScale.toFixed(2)}×
        </Typography>
        <Slider
          size="small"
          value={fontScale}
          min={0.25}
          max={3}
          step={0.05}
          onChange={(_, v) => setAssetOverride(activeAssetType, { neonTextFontScale: v as number })}
        />
      </Box>
      <FormControl size="small" sx={{ maxWidth: 200 }}>
        <InputLabel>Text align (override)</InputLabel>
        <Select
          label="Text align (override)"
          value={align}
          onChange={(e: SelectChangeEvent) =>
            setAssetOverride(activeAssetType, { neonTextAlign: e.target.value as AlignItems })
          }
        >
          {ALIGN_OVERRIDE_OPTIONS.map((a) => (
            <MenuItem key={a} value={a}>
              {a}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

export default function App() {
  const layers = useProjectStore((s) => s.layers);
  const setLayer = useProjectStore((s) => s.setLayer);
  const selectedGame = useProjectStore((s) => s.selectedGame);
  const activeAssetType = useProjectStore((s) => s.activeAssetType);
  const setActiveAssetType = useProjectStore((s) => s.setActiveAssetType);
  const assetOverrides = useProjectStore((s) => s.assetOverrides);

  const spec = ASSET_SPECS[activeAssetType];
  const backgroundUrl = useMemo(
    () => resolveBackgroundUrl(layers, selectedGame, activeAssetType),
    [layers, selectedGame, activeAssetType],
  );
  const overrides = assetOverrides[activeAssetType];

  async function handleUpload(file: File) {
    const dataUrl = await readFileAsDataUrl(file);
    setLayer('backgroundImage', { imageUrl: dataUrl });
  }

  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap', py: 1.5 }}>
          <Typography variant="h6" sx={{ flexShrink: 0 }}>
            Steam Artwork Generator
          </Typography>
          <GamePicker />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
        <PresetBar />
        <Divider sx={{ my: 2 }} />
        <AssetTypeTabs value={activeAssetType} onChange={setActiveAssetType} />

        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={5}>
            <Stack spacing={2} alignItems="center">
              <LivePreview
                layers={layers}
                width={spec.width}
                height={spec.height}
                transparent={spec.transparent}
                backgroundUrl={backgroundUrl}
                fontScale={overrides?.neonTextFontScale}
                alignOverride={overrides?.neonTextAlign}
                maxPreviewWidth={480}
              />
              <AssetOverridePanel />
              <Box sx={{ width: '100%' }}>
                <ExportBar />
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              <BackgroundImagePanel
                layer={layers.backgroundImage}
                onChange={(patch) => setLayer('backgroundImage', patch)}
                onUpload={handleUpload}
              />
              <GradientOverlayPanel layer={layers.gradientOverlay} onChange={(patch) => setLayer('gradientOverlay', patch)} />
              <GlowPanel layer={layers.glow} onChange={(patch) => setLayer('glow', patch)} />
              <NeonTextPanel layer={layers.neonText} onChange={(patch) => setLayer('neonText', patch)} />
              <GrainPanel layer={layers.grain} onChange={(patch) => setLayer('grain', patch)} />
              <VignettePanel layer={layers.vignette} onChange={(patch) => setLayer('vignette', patch)} />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
