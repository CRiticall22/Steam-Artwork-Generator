import { Box, Slider, TextField, Typography } from '@mui/material';
import type { RGBA } from '../types/layers';
import { hexToRgb } from '../render/canvasRenderer';

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface HexColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

/** Solid-color field (no alpha) — used for glow color, text color, grain
 * tint, vignette color. */
export function HexColorField({ label, value, onChange }: HexColorFieldProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer' }}
        aria-label={label}
      />
      <TextField size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)} />
    </Box>
  );
}

interface RgbaColorFieldProps {
  label: string;
  value: RGBA;
  onChange: (rgba: RGBA) => void;
}

/** RGBA field with an alpha slider — used for the two gradient stop
 * colors, where transparency is a real part of the look. */
export function RgbaColorField({ label, value, onChange }: RgbaColorFieldProps) {
  const hex = rgbToHex(value);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 180 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange({ ...hexToRgb(e.target.value), a: value.a })}
          style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer' }}
          aria-label={label}
        />
        <Typography variant="body2">{label}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 42 }}>
          alpha
        </Typography>
        <Slider
          size="small"
          value={value.a}
          min={0}
          max={1}
          step={0.01}
          onChange={(_, v) => onChange({ ...value, a: v as number })}
        />
      </Box>
    </Box>
  );
}
