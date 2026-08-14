import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak, speakOptionsForPreferences } from '@services/audio/speech';

import { useSavedPhrases } from '../hooks/useSavedPhrases';
import { addSavedPhrase } from '../storage/savedPhrasesRepository';
import type { AacCard, SavedPhrase } from '../types';

function spokenTextOf(card: AacCard): string {
  return card.spokenText ?? card.label;
}

interface PhraseContextValue {
  phrase: AacCard[];
  /** Habla la tarjeta de inmediato y la agrega a la barra de frase (un solo toque). */
  addCard: (card: AacCard) => void;
  /** Quita una tarjeta puntual de la frase (no necesariamente la última). */
  removeAt: (index: number) => void;
  removeLast: () => void;
  clear: () => void;
  speakPhrase: () => void;
  /** Persiste la frase en construcción para reusarla después (no la borra del borrador). */
  savePhrase: () => Promise<void>;
  savedPhrases: SavedPhrase[];
  speakSavedPhrase: (saved: SavedPhrase) => void;
  deleteSavedPhrase: (id: string) => Promise<void>;
}

const PhraseContext = createContext<PhraseContextValue | undefined>(undefined);

/**
 * Vive solo mientras el niño está dentro de "Mi Voz" (se monta junto con
 * `AacNavigator`); no se persiste a propósito, es el borrador de la frase
 * que se está construyendo en este momento. Las frases *guardadas*
 * ("Guardar frase") sí se persisten por perfil (`useSavedPhrases`); vivir
 * en el mismo contexto que el borrador evita tener dos fuentes de verdad
 * y mantiene a `AacHomeScreen` sincronizado sin lógica de refresco manual.
 */
export function PhraseProvider({ children }: { children: ReactNode }) {
  const { activeProfile } = useProfiles();
  const soundEnabled = activeProfile?.preferences.soundEnabled ?? true;
  /**
   * "Hablar al tocar" (Mi Voz AAC Pro): ON habla cada tarjeta de inmediato
   * (comportamiento original). OFF solo agrega la palabra a la frase; se
   * habla junto con el resto al pulsar "Hablar" (`speakPhrase`).
   */
  const speakOnTap = activeProfile?.preferences.speakOnTap ?? true;
  const ttsOptions = speakOptionsForPreferences(activeProfile?.preferences);
  const [phrase, setPhrase] = useState<AacCard[]>([]);
  const { phrases: savedPhrases, reload: reloadSavedPhrases, deletePhrase: deleteSavedPhrase } = useSavedPhrases(
    activeProfile?.id ?? null,
  );

  const addCard = useCallback(
    (card: AacCard) => {
      if (soundEnabled && speakOnTap) {
        speak(spokenTextOf(card), ttsOptions);
      }
      setPhrase((current) => [...current, card]);
    },
    [soundEnabled, speakOnTap, ttsOptions],
  );

  const removeAt = useCallback((index: number) => {
    setPhrase((current) => current.filter((_, cardIndex) => cardIndex !== index));
  }, []);

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
    speak(phrase.map(spokenTextOf).join(' '), ttsOptions);
  }, [phrase, soundEnabled, ttsOptions]);

  const savePhrase = useCallback(async () => {
    if (!activeProfile || phrase.length === 0) {
      return;
    }
    await addSavedPhrase(activeProfile.id, phrase.map(spokenTextOf));
    await reloadSavedPhrases();
  }, [activeProfile, phrase, reloadSavedPhrases]);

  const speakSavedPhrase = useCallback(
    (saved: SavedPhrase) => {
      if (!soundEnabled) {
        return;
      }
      speak(saved.words.join(' '), ttsOptions);
    },
    [soundEnabled, ttsOptions],
  );

  const value = useMemo<PhraseContextValue>(
    () => ({
      phrase,
      addCard,
      removeAt,
      removeLast,
      clear,
      speakPhrase,
      savePhrase,
      savedPhrases,
      speakSavedPhrase,
      deleteSavedPhrase,
    }),
    [phrase, addCard, removeAt, removeLast, clear, speakPhrase, savePhrase, savedPhrases, speakSavedPhrase, deleteSavedPhrase],
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
