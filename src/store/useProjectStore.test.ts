import { beforeEach, describe, expect, it } from 'vitest';
import { allPresets, useProjectStore } from './useProjectStore';
import { SEED_PRESETS } from '../data/presets';

beforeEach(() => {
  useProjectStore.getState().resetProject();
  useProjectStore.setState({ customPresets: [] });
});

describe('setLayer', () => {
  it('merges a patch into the named layer without touching others', () => {
    const before = useProjectStore.getState().layers;
    useProjectStore.getState().setLayer('neonText', { text: 'HADES' });
    const after = useProjectStore.getState().layers;

    expect(after.neonText.text).toBe('HADES');
    expect(after.neonText.fontFamily).toBe(before.neonText.fontFamily);
    expect(after.glow).toBe(before.glow); // untouched layer keeps referential identity
  });
});

describe('selected game', () => {
  it('sets and clears the selected game', () => {
    useProjectStore.getState().setSelectedGame({ appid: 1145360, name: 'Hades', proxiedImageUrls: {} });
    expect(useProjectStore.getState().selectedGame?.name).toBe('Hades');

    useProjectStore.getState().setSelectedGame(null);
    expect(useProjectStore.getState().selectedGame).toBeNull();
  });

  it('records a proxied image url per asset type', () => {
    useProjectStore.getState().setSelectedGame({ appid: 1145360, name: 'Hades', proxiedImageUrls: {} });
    useProjectStore.getState().setGameImageUrl('libraryHero', '/api/image-proxy?url=hero.jpg');

    expect(useProjectStore.getState().selectedGame?.proxiedImageUrls.libraryHero).toBe(
      '/api/image-proxy?url=hero.jpg',
    );
  });

  it('is a no-op when no game is selected yet', () => {
    useProjectStore.getState().setGameImageUrl('libraryHero', '/api/image-proxy?url=hero.jpg');
    expect(useProjectStore.getState().selectedGame).toBeNull();
  });
});

describe('asset overrides', () => {
  it('scopes overrides to a single asset type', () => {
    useProjectStore.getState().setAssetOverride('logo', { neonTextFontScale: 2 });
    useProjectStore.getState().setAssetOverride('smallCapsule', { neonTextFontScale: 0.5 });

    const overrides = useProjectStore.getState().assetOverrides;
    expect(overrides.logo?.neonTextFontScale).toBe(2);
    expect(overrides.smallCapsule?.neonTextFontScale).toBe(0.5);
  });
});

describe('presets', () => {
  it('applies a preset wholesale over the current layer stack', () => {
    useProjectStore.getState().setLayer('neonText', { text: 'CUSTOM TEXT' });
    useProjectStore.getState().applyPreset(SEED_PRESETS[1]);

    expect(useProjectStore.getState().layers).toEqual(SEED_PRESETS[1].layers);
  });

  it('saves the current layer stack as a new custom preset', () => {
    useProjectStore.getState().setLayer('neonText', { text: 'MY GAME' });
    const saved = useProjectStore.getState().saveCustomPreset('My Look', 'a test preset');

    expect(useProjectStore.getState().customPresets).toHaveLength(1);
    expect(saved.layers.neonText.text).toBe('MY GAME');
    expect(allPresets(useProjectStore.getState().customPresets)).toHaveLength(SEED_PRESETS.length + 1);
  });

  it('deletes a custom preset by id', () => {
    const saved = useProjectStore.getState().saveCustomPreset('Temp', '');
    useProjectStore.getState().deleteCustomPreset(saved.id);

    expect(useProjectStore.getState().customPresets).toHaveLength(0);
  });
});

describe('resetProject', () => {
  it('restores default layers and clears the selected game, but keeps custom presets', () => {
    useProjectStore.getState().setSelectedGame({ appid: 1, name: 'Test', proxiedImageUrls: {} });
    useProjectStore.getState().saveCustomPreset('Keep me', '');
    useProjectStore.getState().resetProject();

    expect(useProjectStore.getState().selectedGame).toBeNull();
    expect(useProjectStore.getState().activeAssetType).toBe('libraryCapsule');
    expect(useProjectStore.getState().customPresets).toHaveLength(1);
  });
});
