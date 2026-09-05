import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { BLEND_MODES, type BlendMode } from '../types/layers';

interface BlendModeSelectProps {
  label: string;
  value: BlendMode;
  onChange: (mode: BlendMode) => void;
}

export function BlendModeSelect({ label, value, onChange }: BlendModeSelectProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(e: SelectChangeEvent) => onChange(e.target.value as BlendMode)}>
        {BLEND_MODES.map((mode) => (
          <MenuItem key={mode} value={mode}>
            {mode}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
