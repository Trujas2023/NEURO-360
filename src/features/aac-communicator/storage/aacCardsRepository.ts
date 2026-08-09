import { getItem, removeItem, setItem } from '@services/storage/asyncStorage';

import type { AacCard } from '../types';

function cardsKey(profileId: string): string {
  return `sense-play/aac/cards/${profileId}`;
}

/**
 * `null` significa "nunca se guardó nada para este perfil" (primera vez,
 * corresponde sembrar el vocabulario por defecto). Un array vacío `[]`
 * significa que el adulto eliminó todas las tarjetas a propósito, y no
 * debe volver a sembrarse.
 */
export async function getAacCards(profileId: string): Promise<AacCard[] | null> {
  return getItem<AacCard[]>(cardsKey(profileId));
}

export async function saveAacCards(profileId: string, cards: AacCard[]): Promise<void> {
  await setItem(cardsKey(profileId), cards);
}

export async function removeAacCards(profileId: string): Promise<void> {
  await removeItem(cardsKey(profileId));
}
