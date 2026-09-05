import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import type { SteamGameResult } from '../types/asset';
import { ASSET_TYPE_ORDER } from '../types/asset';
import { searchSteamGames } from '../data/steamApi';
import { proxiedImageUrl, steamCdnImageUrl } from '../data/steamCdn';
import { useProjectStore } from '../store/useProjectStore';

const DEBOUNCE_MS = 300;

export function GamePicker() {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<SteamGameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  const selectedGame = useProjectStore((s) => s.selectedGame);
  const setSelectedGame = useProjectStore((s) => s.setSelectedGame);
  const setGameImageUrl = useProjectStore((s) => s.setGameImageUrl);
  const setLayer = useProjectStore((s) => s.setLayer);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputValue.trim()) {
      setOptions([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const results = await searchSteamGames(inputValue, controller.signal);
        setOptions(results);
      } catch {
        // A stale/aborted request or a transient network error — leave the
        // previous options in place rather than flashing an empty list.
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [inputValue]);

  const selectedOption = useMemo(
    () => (selectedGame ? { appid: selectedGame.appid, name: selectedGame.name } : null),
    [selectedGame],
  );

  async function handleSelect(game: SteamGameResult | null) {
    if (!game) {
      setSelectedGame(null);
      return;
    }
    setSelectedGame({ ...game, proxiedImageUrls: {} });
    setLayer('neonText', { text: game.name.toUpperCase() });

    for (const assetType of ASSET_TYPE_ORDER) {
      const sourceUrl = steamCdnImageUrl(game.appid, assetType);
      if (sourceUrl) {
        setGameImageUrl(assetType, proxiedImageUrl(sourceUrl));
      }
    }
  }

  return (
    <Autocomplete
      value={selectedOption}
      onChange={(_, value) => handleSelect(value)}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      options={options}
      loading={loading}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(a, b) => a.appid === b.appid}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search a Steam game"
          placeholder="e.g. Hades"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={16} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{ minWidth: 320 }}
    />
  );
}
