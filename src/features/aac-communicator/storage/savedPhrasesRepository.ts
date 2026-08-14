import { getItem, removeItem, setItem } from '@services/storage/asyncStorage';
import { registerProfileDataCleanup } from '@services/storage/profileDataRegistry';
import { createId } from '@shared/utils/id';

import type { SavedPhrase } from '../types';

function savedPhrasesKey(profileId: string): string {
  return `sense-play/aac/saved-phrases/${profileId}`;
}

export async function getSavedPhrases(profileId: string): Promise<SavedPhrase[]> {
  return (await getItem<SavedPhrase[]>(savedPhrasesKey(profileId))) ?? [];
}

async function saveSavedPhrases(profileId: string, phrases: SavedPhrase[]): Promise<void> {
  await setItem(savedPhrasesKey(profileId), phrases);
}

export async function addSavedPhrase(profileId: string, words: string[]): Promise<SavedPhrase | null> {
  if (words.length === 0) {
    return null;
  }
  const phrase: SavedPhrase = { id: createId(), words, createdAt: new Date().toISOString() };
  const current = await getSavedPhrases(profileId);
  await saveSavedPhrases(profileId, [...current, phrase]);
  return phrase;
}

export async function deleteSavedPhrase(profileId: string, phraseId: string): Promise<void> {
  const current = await getSavedPhrases(profileId);
  await saveSavedPhrases(
    profileId,
    current.filter((phrase) => phrase.id !== phraseId),
  );
}

export async function removeSavedPhrases(profileId: string): Promise<void> {
  await removeItem(savedPhrasesKey(profileId));
}

// Borra las frases guardadas del perfil cuando `ProfilesContext` elimina
// ese perfil, para no dejar datos huérfanos en AsyncStorage.
registerProfileDataCleanup(removeSavedPhrases);
