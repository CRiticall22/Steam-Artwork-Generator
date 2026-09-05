import { Tab, Tabs } from '@mui/material';
import { ASSET_SPECS, ASSET_TYPE_ORDER } from '../types/asset';
import type { AssetTypeId } from '../types/asset';

interface AssetTypeTabsProps {
  value: AssetTypeId;
  onChange: (assetType: AssetTypeId) => void;
}

export function AssetTypeTabs({ value, onChange }: AssetTypeTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_, v) => onChange(v)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      {ASSET_TYPE_ORDER.map((id) => {
        const spec = ASSET_SPECS[id];
        return <Tab key={id} value={id} label={`${spec.label} · ${spec.width}×${spec.height}`} />;
      })}
    </Tabs>
  );
}
