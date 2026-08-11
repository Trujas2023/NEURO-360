import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_SENSORY_PREFERENCES } from '../constants/games';
import { getSensoryPreferences, saveSensoryPreferences } from '../storage/sensoryPreferencesRepository';
import type { SensoryPreferences } from '../types';

export interface UseSensoryPreferencesResult {
  preferences: SensoryPreferences;
  loading: boolean;
  update: (updates: Partial<SensoryPreferences>) => Promise<void>;
}

/** Ajustes sensoriales de un perfil concreto, con valores por defecto mientras cargan. */
export function useSensoryPreferences(profileId: string | null): UseSensoryPreferencesResult {
  const [preferences, setPreferences] = useState<SensoryPreferences>(DEFAULT_SENSORY_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!profileId) {
        if (isMounted) {
          setPreferences(DEFAULT_SENSORY_PREFERENCES);
          setLoading(false);
        }
        return;
      }
      const stored = await getSensoryPreferences(profileId);
      if (isMounted) {
        setPreferences(stored);
        setLoading(false);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const update = useCallback(
    async (updates: Partial<SensoryPreferences>) => {
      const next = { ...preferences, ...updates };
      setPreferences(next);
      if (profileId) {
        await saveSensoryPreferences(profileId, next);
      }
    },
    [preferences, profileId],
  );

  return useMemo(() => ({ preferences, loading, update }), [preferences, loading, update]);
}
