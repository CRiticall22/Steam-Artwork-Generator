import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { ReactNode } from 'react';
import type {
  BackgroundImageLayer,
  GlowLayer,
  GradientOverlayLayer,
  GrainLayer,
  NeonTextLayer,
  VignetteLayer,
} from '../types/layers';
import { BlendModeSelect } from './BlendModeSelect';
import { HexColorField, RgbaColorField } from './ColorField';
import { FONT_FAMILIES } from '../data/fonts';

function Panel({ title, enabled, onToggle, children }: {
  title: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, opacity: enabled ? 1 : 0.55 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1">{title}</Typography>
        <FormControlLabel control={<Switch checked={enabled} onChange={(e) => onToggle(e.target.checked)} />} label="" />
      </Stack>
      <Stack spacing={2} sx={{ pointerEvents: enabled ? 'auto' : 'none' }}>
        {children}
      </Stack>
    </Paper>
  );
}

function LabeledSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix = '',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}: {value}
        {suffix}
      </Typography>
      <Slider size="small" value={value} min={min} max={max} step={step} onChange={(_, v) => onChange(v as number)} />
    </Box>
  );
}

export function BackgroundImagePanel({
  layer,
  onChange,
  onUpload,
}: {
  layer: BackgroundImageLayer;
  onChange: (patch: Partial<BackgroundImageLayer>) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <Panel title="Background Image" enabled={layer.enabled} onToggle={(v) => onChange({ enabled: v })}>
      <Stack direction="row" spacing={2} alignItems="center">
        <label htmlFor="bg-upload-input">
          <Box
            component="span"
            sx={{
              px: 2,
              py: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Upload image
          </Box>
        </label>
        <input
          id="bg-upload-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        {layer.imageUrl && (
          <Typography variant="caption" color="text.secondary">
            image set
          </Typography>
        )}
      </Stack>
      <FormControl size="small" sx={{ maxWidth: 160 }}>
        <InputLabel>Fit</InputLabel>
        <Select
          label="Fit"
          value={layer.fit}
          onChange={(e: SelectChangeEvent) => onChange({ fit: e.target.value as BackgroundImageLayer['fit'] })}
        >
          <MenuItem value="cover">cover</MenuItem>
          <MenuItem value="contain">contain</MenuItem>
          <MenuItem value="stretch">stretch</MenuItem>
        </Select>
      </FormControl>
      <LabeledSlider label="Opacity" value={layer.opacity} min={0} max={1} step={0.01} onChange={(v) => onChange({ opacity: v })} />
    </Panel>
  );
}

export function GradientOverlayPanel({
  layer,
  onChange,
}: {
  layer: GradientOverlayLayer;
  onChange: (patch: Partial<GradientOverlayLayer>) => void;
}) {
  return (
    <Panel title="Gradient Overlay" enabled={layer.enabled} onToggle={(v) => onChange({ enabled: v })}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <RgbaColorField label="Color A" value={layer.colorA} onChange={(rgba) => onChange({ colorA: rgba })} />
        <RgbaColorField label="Color B" value={layer.colorB} onChange={(rgba) => onChange({ colorB: rgba })} />
      </Stack>
      <LabeledSlider label="Angle" value={layer.angle} min={0} max={360} step={1} suffix="°" onChange={(v) => onChange({ angle: v })} />
      <LabeledSlider label="Opacity" value={layer.opacity} min={0} max={1} step={0.01} onChange={(v) => onChange({ opacity: v })} />
      <BlendModeSelect label="Blend mode" value={layer.blendMode} onChange={(mode) => onChange({ blendMode: mode })} />
      <FormControlLabel
        control={<Switch checked={layer.animated} onChange={(e) => onChange({ animated: e.target.checked })} />}
        label="Animate sweep"
      />
      {layer.animated && (
        <LabeledSlider
          label="Sweep speed"
          value={layer.animationSpeedSec}
          min={1}
          max={20}
          step={0.5}
          suffix="s"
          onChange={(v) => onChange({ animationSpeedSec: v })}
        />
      )}
    </Panel>
  );
}

export function GlowPanel({ layer, onChange }: { layer: GlowLayer; onChange: (patch: Partial<GlowLayer>) => void }) {
  return (
    <Panel title="Glow" enabled={layer.enabled} onToggle={(v) => onChange({ enabled: v })}>
      <HexColorField label="Color" value={layer.color} onChange={(hex) => onChange({ color: hex })} />
      <LabeledSlider label="Blur radius" value={layer.blurRadius} min={0} max={80} step={1} suffix="px" onChange={(v) => onChange({ blurRadius: v })} />
      <LabeledSlider label="Intensity" value={layer.intensity} min={0} max={1} step={0.01} onChange={(v) => onChange({ intensity: v })} />
      <LabeledSlider
        label="Pulse speed"
        value={layer.animationSpeedSec}
        min={1}
        max={10}
        step={0.5}
        suffix="s"
        onChange={(v) => onChange({ animationSpeedSec: v })}
      />
    </Panel>
  );
}

const ALIGN_OPTIONS: NeonTextLayer['align'][] = ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'];

export function NeonTextPanel({ layer, onChange }: { layer: NeonTextLayer; onChange: (patch: Partial<NeonTextLayer>) => void }) {
  return (
    <Panel title="Neon Logo Text" enabled={layer.enabled} onToggle={(v) => onChange({ enabled: v })}>
      <TextField size="small" label="Text" value={layer.text} onChange={(e) => onChange({ text: e.target.value })} />
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Font family</InputLabel>
          <Select label="Font family" value={layer.fontFamily} onChange={(e: SelectChangeEvent) => onChange({ fontFamily: e.target.value })}>
            {FONT_FAMILIES.map((f) => (
              <MenuItem key={f} value={f}>
                {f}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Align</InputLabel>
          <Select label="Align" value={layer.align} onChange={(e: SelectChangeEvent) => onChange({ align: e.target.value as NeonTextLayer['align'] })}>
            {ALIGN_OPTIONS.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <HexColorField label="Color" value={layer.color} onChange={(hex) => onChange({ color: hex })} />
      </Stack>
      <LabeledSlider label="Font size" value={layer.fontSize} min={20} max={240} step={2} suffix="px" onChange={(v) => onChange({ fontSize: v })} />
      <LabeledSlider label="Font weight" value={layer.fontWeight} min={100} max={900} step={100} onChange={(v) => onChange({ fontWeight: v })} />
      <LabeledSlider label="Letter spacing" value={layer.letterSpacing} min={-4} max={40} step={0.5} suffix="px" onChange={(v) => onChange({ letterSpacing: v })} />
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <LabeledSlider label="Padding top" value={layer.paddingTop} min={-200} max={200} step={2} onChange={(v) => onChange({ paddingTop: v })} />
        <LabeledSlider label="Padding bottom" value={layer.paddingBottom} min={-200} max={200} step={2} onChange={(v) => onChange({ paddingBottom: v })} />
        <LabeledSlider label="Padding left" value={layer.paddingLeft} min={-200} max={200} step={2} onChange={(v) => onChange({ paddingLeft: v })} />
        <LabeledSlider label="Padding right" value={layer.paddingRight} min={-200} max={200} step={2} onChange={(v) => onChange({ paddingRight: v })} />
      </Stack>
      <BlendModeSelect label="Ghost blend mode" value={layer.ghostBlendMode} onChange={(mode) => onChange({ ghostBlendMode: mode })} />
      <LabeledSlider label="Ghost blur" value={layer.ghostBlurPx} min={0} max={20} step={0.5} suffix="px" onChange={(v) => onChange({ ghostBlurPx: v })} />
    </Panel>
  );
}

export function GrainPanel({ layer, onChange }: { layer: GrainLayer; onChange: (patch: Partial<GrainLayer>) => void }) {
  return (
    <Panel title="Grain" enabled={layer.enabled} onToggle={(v) => onChange({ enabled: v })}>
      <LabeledSlider label="Intensity" value={layer.intensity} min={0} max={1} step={0.01} onChange={(v) => onChange({ intensity: v })} />
      <LabeledSlider label="Cell size" value={layer.cellSize} min={1} max={8} step={1} suffix="px" onChange={(v) => onChange({ cellSize: v })} />
      <FormControlLabel
        control={<Switch checked={layer.monochrome} onChange={(e) => onChange({ monochrome: e.target.checked })} />}
        label="Monochrome"
      />
      <BlendModeSelect label="Blend mode" value={layer.blendMode} onChange={(mode) => onChange({ blendMode: mode })} />
    </Panel>
  );
}

export function VignettePanel({ layer, onChange }: { layer: VignetteLayer; onChange: (patch: Partial<VignetteLayer>) => void }) {
  return (
    <Panel title="Vignette" enabled={layer.enabled} onToggle={(v) => onChange({ enabled: v })}>
      <HexColorField label="Color" value={layer.color} onChange={(hex) => onChange({ color: hex })} />
      <LabeledSlider label="Strength" value={layer.strength} min={0} max={1} step={0.01} onChange={(v) => onChange({ strength: v })} />
      <LabeledSlider label="Spread" value={layer.spread} min={0} max={1} step={0.01} onChange={(v) => onChange({ spread: v })} />
    </Panel>
  );
}
