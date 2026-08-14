import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_SENSORY_SETTINGS } from '../data/activities';
import { getSensorySettings, saveSensorySettings } from '../storage/sensorySettingsRepository';
import type { SensorySettings } from '../types';

export interface UseSensorySettingsResult {
  settings: SensorySettings;
  loading: boolean;
  updateSettings: (updates: Partial<SensorySettings>) => Promise<void>;
}

/** Ajustes de Mundo Sensorial de un perfil concreto (los edita un adulto tras el PIN). */
export function useSensorySettings(profileId: string | null): UseSensorySettingsResult {
  const [settings, setSettings] = useState<SensorySettings>(DEFAULT_SENSORY_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!profileId) {
        if (isMounted) {
          setSettings(DEFAULT_SENSORY_SETTINGS);
          setLoading(false);
        }
        return;
      }
      const result = await getSensorySettings(profileId);
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
    async (updates: Partial<SensorySettings>) => {
      const next = { ...settings, ...updates };
      setSettings(next);
      if (profileId) {
        await saveSensorySettings(profileId, next);
      }
    },
    [settings, profileId],
  );

  return useMemo(() => ({ settings, loading, updateSettings }), [settings, loading, updateSettings]);
}
