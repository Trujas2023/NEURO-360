import { getItem, removeItem, setItem } from '@services/storage/asyncStorage';
import { registerProfileDataCleanup } from '@services/storage/profileDataRegistry';

import type { GameSettings } from '../types';

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficulty: 'easy',
  sessionLength: 'short',
  soundEnabled: true,
  hapticsEnabled: true,
};

function settingsKey(profileId: string): string {
  return `sense-play/games/settings/${profileId}`;
}

/**
 * Se completa siempre con los valores por defecto, así agregar un ajuste
 * nuevo más adelante no rompe los perfiles ya guardados.
 */
export async function getGameSettings(profileId: string): Promise<GameSettings> {
  const stored = await getItem<Partial<GameSettings>>(settingsKey(profileId));
  return { ...DEFAULT_GAME_SETTINGS, ...stored };
}

export async function saveGameSettings(profileId: string, settings: GameSettings): Promise<void> {
  await setItem(settingsKey(profileId), settings);
}

export async function removeGameSettings(profileId: string): Promise<void> {
  await removeItem(settingsKey(profileId));
}

// Borra los ajustes de juegos del perfil cuando `ProfilesContext` elimina
// ese perfil, para no dejar datos huérfanos en AsyncStorage.
registerProfileDataCleanup(removeGameSettings);
