import { useCallback, useEffect, useMemo, useState } from 'react';

import { deleteSavedPhrase, getSavedPhrases } from '../storage/savedPhrasesRepository';
import type { SavedPhrase } from '../types';

export interface UseSavedPhrasesResult {
  phrases: SavedPhrase[];
  loading: boolean;
  reload: () => Promise<void>;
  deletePhrase: (id: string) => Promise<void>;
}

/** Frases guardadas ("Guardar frase" en la barra de frase) de un perfil concreto. */
export function useSavedPhrases(profileId: string | null): UseSavedPhrasesResult {
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!profileId) {
        if (isMounted) {
          setPhrases([]);
          setLoading(false);
        }
        return;
      }
      const result = await getSavedPhrases(profileId);
      if (isMounted) {
        setPhrases(result);
        setLoading(false);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const reload = useCallback(async () => {
    if (!profileId) {
      setPhrases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getSavedPhrases(profileId);
    setPhrases(result);
    setLoading(false);
  }, [profileId]);

  const deletePhrase = useCallback(
    async (id: string) => {
      if (!profileId) {
        return;
      }
      await deleteSavedPhrase(profileId, id);
      setPhrases((current) => current.filter((phrase) => phrase.id !== id));
    },
    [profileId],
  );

  return useMemo(() => ({ phrases, loading, reload, deletePhrase }), [phrases, loading, reload, deletePhrase]);
}
