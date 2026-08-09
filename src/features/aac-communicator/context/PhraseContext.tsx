import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak } from '@services/audio/speech';

import type { AacCard } from '../types';

interface PhraseContextValue {
  phrase: AacCard[];
  /** Habla la tarjeta de inmediato y la agrega a la barra de frase (un solo toque). */
  addCard: (card: AacCard) => void;
  removeLast: () => void;
  clear: () => void;
  speakPhrase: () => void;
}

const PhraseContext = createContext<PhraseContextValue | undefined>(undefined);

/**
 * Vive solo mientras el niño está dentro de "Mi Voz" (se monta junto con
 * `AacNavigator`); no se persiste a propósito, es el borrador de la frase
 * que se está construyendo en este momento.
 */
export function PhraseProvider({ children }: { children: ReactNode }) {
  const { activeProfile } = useProfiles();
  const soundEnabled = activeProfile?.preferences.soundEnabled ?? true;
  const [phrase, setPhrase] = useState<AacCard[]>([]);

  const addCard = useCallback(
    (card: AacCard) => {
      if (soundEnabled) {
        speak(card.label);
      }
      setPhrase((current) => [...current, card]);
    },
    [soundEnabled],
  );

  const removeLast = useCallback(() => {
    setPhrase((current) => current.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    setPhrase([]);
  }, []);

  const speakPhrase = useCallback(() => {
    if (!soundEnabled || phrase.length === 0) {
      return;
    }
    speak(phrase.map((card) => card.label).join(' '));
  }, [phrase, soundEnabled]);

  const value = useMemo<PhraseContextValue>(
    () => ({ phrase, addCard, removeLast, clear, speakPhrase }),
    [phrase, addCard, removeLast, clear, speakPhrase],
  );

  return <PhraseContext.Provider value={value}>{children}</PhraseContext.Provider>;
}

export function usePhrase(): PhraseContextValue {
  const context = useContext(PhraseContext);
  if (!context) {
    throw new Error('usePhrase debe usarse dentro de un PhraseProvider');
  }
  return context;
}
