import { getItem, removeItem, setItem } from '@services/storage/asyncStorage';
import { registerProfileDataCleanup } from '@services/storage/profileDataRegistry';

import { DEFAULT_SENSORY_PREFERENCES } from '../constants/games';
import type { SensoryPreferences } from '../types';

function preferencesKey(profileId: string): string {
  return `sense-play/sensory/preferences/${profileId}`;
}

export async function getSensoryPreferences(profileId: string): Promise<SensoryPreferences> {
  const stored = await getItem<SensoryPreferences>(preferencesKey(profileId));
  return stored ?? DEFAULT_SENSORY_PREFERENCES;
}

export async function saveSensoryPreferences(
  profileId: string,
  preferences: SensoryPreferences,
): Promise<void> {
  await setItem(preferencesKey(profileId), preferences);
}

async function removeSensoryPreferences(profileId: string): Promise<void> {
  await removeItem(preferencesKey(profileId));
}

// Borra los ajustes sensoriales del perfil cuando `ProfilesContext` elimina
// ese perfil, para no dejar datos huérfanos en AsyncStorage (mismo patrón
// que `aacCardsRepository`).
registerProfileDataCleanup(removeSensoryPreferences);
