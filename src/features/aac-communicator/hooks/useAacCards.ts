import { useCallback, useEffect, useMemo, useState } from 'react';

import { deleteRecording } from '@services/audio';
import { createId } from '@shared/utils/id';

import { buildDefaultCards } from '../constants/seedCards';
import { getAacCards, saveAacCards } from '../storage/aacCardsRepository';
import type { AacCard, CreateAacCardInput, UpdateAacCardInput } from '../types';

export interface UseAacCardsResult {
  cards: AacCard[];
  loading: boolean;
  reload: () => Promise<void>;
  createCard: (input: CreateAacCardInput) => Promise<AacCard>;
  updateCard: (id: string, updates: UpdateAacCardInput) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  moveCard: (id: string, direction: 'up' | 'down') => Promise<void>;
  /** Suma un uso y actualiza `lastUsedAt`; usado por "Más usados"/"Recientes". */
  incrementUsage: (id: string) => Promise<void>;
}

/** Lee las tarjetas guardadas de un perfil, sembrando el vocabulario por defecto la primera vez. */
async function loadCardsForProfile(profileId: string): Promise<AacCard[]> {
  const stored = await getAacCards(profileId);
  if (stored === null) {
    const seeded = buildDefaultCards();
    await saveAacCards(profileId, seeded);
    return seeded;
  }
  return stored;
}

/** Datos y acciones de las tarjetas AAC de un perfil concreto, con siembra automática la primera vez. */
export function useAacCards(profileId: string | null): UseAacCardsResult {
  const [cards, setCards] = useState<AacCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!profileId) {
        if (isMounted) {
          setCards([]);
          setLoading(false);
        }
        return;
      }
      const result = await loadCardsForProfile(profileId);
      if (isMounted) {
        setCards(result);
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
      setCards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await loadCardsForProfile(profileId);
    setCards(result);
    setLoading(false);
  }, [profileId]);

  const persist = useCallback(
    async (next: AacCard[]) => {
      setCards(next);
      if (profileId) {
        await saveAacCards(profileId, next);
      }
    },
    [profileId],
  );

  const createCard = useCallback(
    async (input: CreateAacCardInput) => {
      const cardsInCategory = cards.filter((card) => card.categoryId === input.categoryId);
      const nextOrder = cardsInCategory.reduce((max, card) => Math.max(max, card.order), -1) + 1;

      const trimmedSpokenText = input.spokenText?.trim();
      const card: AacCard = {
        id: createId(),
        categoryId: input.categoryId,
        label: input.label.trim(),
        spokenText: trimmedSpokenText ? trimmedSpokenText : undefined,
        emoji: input.emoji.trim(),
        imageUri: input.imageUri,
        imageType: input.imageUri ? 'photo' : 'icon',
        audioUri: input.audioUri,
        createdByUser: true,
        color: input.color,
        isFavorite: input.isFavorite ?? false,
        order: nextOrder,
        createdAt: new Date().toISOString(),
      };

      await persist([...cards, card]);
      return card;
    },
    [cards, persist],
  );

  const updateCard = useCallback(
    async (id: string, updates: UpdateAacCardInput) => {
      const previous = cards.find((card) => card.id === id);
      await persist(cards.map((card) => (card.id === id ? { ...card, ...updates } : card)));

      // Solo se borra el archivo viejo una vez que el cambio ya se
      // guardó (nunca durante la edición): si el adulto graba de nuevo o
      // quita la grabación y guarda, la anterior queda huérfana en el
      // formulario hasta este momento, así cancelar el formulario nunca
      // deja a una tarjeta con una referencia rota a un audio borrado.
      if (previous?.audioUri && 'audioUri' in updates && updates.audioUri !== previous.audioUri) {
        await deleteRecording(previous.audioUri);
      }
    },
    [cards, persist],
  );

  const deleteCard = useCallback(
    async (id: string) => {
      const target = cards.find((card) => card.id === id);
      await persist(cards.filter((card) => card.id !== id));
      if (target?.audioUri) {
        await deleteRecording(target.audioUri);
      }
    },
    [cards, persist],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      await persist(
        cards.map((card) => (card.id === id ? { ...card, isFavorite: !card.isFavorite } : card)),
      );
    },
    [cards, persist],
  );

  const moveCard = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const target = cards.find((card) => card.id === id);
      if (!target) {
        return;
      }
      const siblings = cards
        .filter((card) => card.categoryId === target.categoryId)
        .sort((a, b) => a.order - b.order);
      const index = siblings.findIndex((card) => card.id === id);
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= siblings.length) {
        return;
      }
      const sibling = siblings[swapIndex];

      await persist(
        cards.map((card) => {
          if (card.id === target.id) {
            return { ...card, order: sibling.order };
          }
          if (card.id === sibling.id) {
            return { ...card, order: target.order };
          }
          return card;
        }),
      );
    },
    [cards, persist],
  );

  const incrementUsage = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      await persist(
        cards.map((card) =>
          card.id === id ? { ...card, usageCount: (card.usageCount ?? 0) + 1, lastUsedAt: now } : card,
        ),
      );
    },
    [cards, persist],
  );

  return useMemo(
    () => ({
      cards,
      loading,
      reload,
      createCard,
      updateCard,
      deleteCard,
      toggleFavorite,
      moveCard,
      incrementUsage,
    }),
    [cards, loading, reload, createCard, updateCard, deleteCard, toggleFavorite, moveCard, incrementUsage],
  );
}
