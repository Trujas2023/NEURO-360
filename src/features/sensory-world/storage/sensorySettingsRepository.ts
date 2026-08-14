import { getItem, removeItem, setItem } from '@services/storage/asyncStorage';
import { registerProfileDataCleanup } from '@services/storage/profileDataRegistry';

import { DEFAULT_SENSORY_SETTINGS } from '../data/activities';
import type { SensorySettings } from '../types';

function settingsKey(profileId: string): string {
  return `sense-play/sensory/settings/${profileId}`;
}

/**
 * Se completa siempre con los valores por defecto, así agregar un ajuste
 * nuevo más adelante no rompe los perfiles ya guardados.
 */
export async function getSensorySettings(profileId: string): Promise<SensorySettings> {
  const stored = await getItem<Partial<SensorySettings>>(settingsKey(profileId));
  return { ...DEFAULT_SENSORY_SETTINGS, ...stored };
}

export async function saveSensorySettings(profileId: string, settings: SensorySettings): Promise<void> {
  await setItem(settingsKey(profileId), settings);
}

export async function removeSensorySettings(profileId: string): Promise<void> {
  await removeItem(settingsKey(profileId));
}

// Borra los ajustes sensoriales del perfil cuando `ProfilesContext`
// elimina ese perfil, para no dejar datos huérfanos en AsyncStorage.
registerProfileDataCleanup(removeSensorySettings);
