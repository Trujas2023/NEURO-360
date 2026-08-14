import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_GAME_SETTINGS,
  getGameSettings,
  saveGameSettings,
} from '../storage/gameSettingsRepository';
import type { GameSettings } from '../types';

export interface UseGameSettingsResult {
  settings: GameSettings;
  loading: boolean;
  updateSettings: (updates: Partial<GameSettings>) => Promise<void>;
}

/**
 * Ajustes de Juega & Regula de un perfil. Las pantallas de juego esperan
 * a `loading === false` antes de armar la primera ronda, para no empezar
 * con la dificultad por defecto y cambiarla a mitad de partida.
 */
export function useGameSettings(profileId: string | null): UseGameSettingsResult {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!profileId) {
        if (isMounted) {
          setSettings(DEFAULT_GAME_SETTINGS);
          setLoading(false);
        }
        return;
      }
      const result = await getGameSettings(profileId);
      if (isMounted) {
        setSettings(result);
        setLoading(false);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const updateSettings = useCallback(
    async (updates: Partial<GameSettings>) => {
      const next = { ...settings, ...updates };
      setSettings(next);
      if (profileId) {
        await saveGameSettings(profileId, next);
      }
    },
    [settings, profileId],
  );

  return useMemo(() => ({ settings, loading, updateSettings }), [settings, loading, updateSettings]);
}
