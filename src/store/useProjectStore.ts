import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayerStack } from '../types/layers';
import type { AssetOverrides, AssetTypeId, SelectedGame } from '../types/asset';
import { createDefaultLayerStack, SEED_PRESETS, type Preset } from '../data/presets';

interface ProjectState {
  layers: LayerStack;
  selectedGame: SelectedGame | null;
  activeAssetType: AssetTypeId;
  assetOverrides: Partial<Record<AssetTypeId, AssetOverrides>>;
  customPresets: Preset[];

  setLayer: <K extends keyof LayerStack>(kind: K, patch: Partial<LayerStack[K]>) => void;
  setSelectedGame: (game: SelectedGame | null) => void;
  setGameImageUrl: (assetType: AssetTypeId, proxiedUrl: string) => void;
  setActiveAssetType: (assetType: AssetTypeId) => void;
  setAssetOverride: (assetType: AssetTypeId, patch: AssetOverrides) => void;
  applyPreset: (preset: Preset) => void;
  saveCustomPreset: (name: string, description: string) => Preset;
  deleteCustomPreset: (id: string) => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      layers: createDefaultLayerStack(),
      selectedGame: null,
      activeAssetType: 'libraryCapsule',
      assetOverrides: {},
      customPresets: [],

      setLayer: (kind, patch) =>
        set((state) => ({
          layers: {
            ...state.layers,
            [kind]: { ...state.layers[kind], ...patch },
          },
        })),

      setSelectedGame: (game) => set({ selectedGame: game }),

      setGameImageUrl: (assetType, proxiedUrl) =>
        set((state) => {
          if (!state.selectedGame) return state;
          return {
            selectedGame: {
              ...state.selectedGame,
              proxiedImageUrls: {
                ...state.selectedGame.proxiedImageUrls,
                [assetType]: proxiedUrl,
              },
            },
          };
        }),

      setActiveAssetType: (assetType) => set({ activeAssetType: assetType }),

      setAssetOverride: (assetType, patch) =>
        set((state) => ({
          assetOverrides: {
            ...state.assetOverrides,
            [assetType]: { ...state.assetOverrides[assetType], ...patch },
          },
        })),

      applyPreset: (preset) => set({ layers: preset.layers }),

      saveCustomPreset: (name, description) => {
        const newPreset: Preset = {
          id: `custom-${Date.now()}`,
          name,
          description,
          layers: get().layers,
        };
        set((state) => ({ customPresets: [...state.customPresets, newPreset] }));
        return newPreset;
      },

      deleteCustomPreset: (id) =>
        set((state) => ({ customPresets: state.customPresets.filter((p) => p.id !== id) })),

      resetProject: () =>
        set({
          layers: createDefaultLayerStack(),
          selectedGame: null,
          activeAssetType: 'libraryCapsule',
          assetOverrides: {},
        }),
    }),
    {
      name: 'steam-artwork-generator/project',
      partialize: (state) => ({
        layers: state.layers,
        selectedGame: state.selectedGame,
        activeAssetType: state.activeAssetType,
        assetOverrides: state.assetOverrides,
        customPresets: state.customPresets,
      }),
    },
  ),
);

export function allPresets(customPresets: Preset[]): Preset[] {
  return [...SEED_PRESETS, ...customPresets];
}
