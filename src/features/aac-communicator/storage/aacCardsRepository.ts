import { deleteRecording } from '@services/audio';
import { getItem, removeItem, setItem } from '@services/storage/asyncStorage';
import { registerProfileDataCleanup } from '@services/storage/profileDataRegistry';

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
  // Borra también las grabaciones de voz de las tarjetas del perfil antes
  // de borrar la lista: son archivos aparte del almacenamiento de
  // AsyncStorage, y quedarían huérfanos en el dispositivo si no se
  // limpian acá.
  const cards = await getAacCards(profileId);
  if (cards) {
    await Promise.all(
      cards.filter((card) => !!card.audioUri).map((card) => deleteRecording(card.audioUri as string)),
    );
  }
  await removeItem(cardsKey(profileId));
}

// Borra las tarjetas AAC del perfil cuando `ProfilesContext` elimina ese
// perfil, para no dejar datos huérfanos en AsyncStorage.
registerProfileDataCleanup(removeAacCards);
