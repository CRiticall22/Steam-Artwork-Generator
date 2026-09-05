import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { SEED_PRESETS, type Preset } from '../data/presets';
import { useProjectStore } from '../store/useProjectStore';

export function PresetBar() {
  const customPresets = useProjectStore((s) => s.customPresets);
  const applyPreset = useProjectStore((s) => s.applyPreset);
  const saveCustomPreset = useProjectStore((s) => s.saveCustomPreset);
  const deleteCustomPreset = useProjectStore((s) => s.deleteCustomPreset);

  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function handleSave() {
    if (!name.trim()) return;
    saveCustomPreset(name.trim(), description.trim());
    setName('');
    setDescription('');
    setSaveOpen(false);
  }

  function handleExport(preset: Preset) {
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        {SEED_PRESETS.map((p) => (
          <Tooltip key={p.id} title={p.description}>
            <Chip label={p.name} onClick={() => applyPreset(p)} variant="outlined" />
          </Tooltip>
        ))}
        {customPresets.map((p) => (
          <Tooltip key={p.id} title={p.description || 'Custom preset'}>
            <Chip
              label={p.name}
              onClick={() => applyPreset(p)}
              onDelete={() => deleteCustomPreset(p.id)}
              color="secondary"
              variant="outlined"
              onDoubleClick={() => handleExport(p)}
            />
          </Tooltip>
        ))}
        <Button size="small" onClick={() => setSaveOpen(true)}>
          Save current as preset
        </Button>
      </Stack>

      <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Save preset</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
