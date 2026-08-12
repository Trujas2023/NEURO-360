import { getItem, removeItem, setItem } from '@services/storage/asyncStorage';
import { registerProfileDataCleanup } from '@services/storage/profileDataRegistry';

import type { DailyRoutine } from '../types';

function routinesKey(profileId: string): string {
  return `sense-play/daily-routine/routines/${profileId}`;
}

/**
 * `null` significa "nunca se guardó nada para este perfil" (primera vez,
 * corresponde sembrar las rutinas por defecto). Un array vacío `[]`
 * significa que el adulto eliminó todas las rutinas a propósito.
 */
export async function getRoutines(profileId: string): Promise<DailyRoutine[] | null> {
  return getItem<DailyRoutine[]>(routinesKey(profileId));
}

export async function saveRoutines(profileId: string, routines: DailyRoutine[]): Promise<void> {
  await setItem(routinesKey(profileId), routines);
}

export async function removeRoutines(profileId: string): Promise<void> {
  await removeItem(routinesKey(profileId));
}

// Borra las rutinas de Mi Día del perfil cuando `ProfilesContext` elimina
// ese perfil, para no dejar datos huérfanos en AsyncStorage.
registerProfileDataCleanup(removeRoutines);
