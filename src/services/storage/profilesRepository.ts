import type { ChildProfile } from '@shared/types';

import { getDb, getSetting, setSetting } from './db';

interface ProfileRow {
  id: string;
  name: string;
  avatarUri: string | null;
  avatarColor: string;
  preferences: string;
  createdAt: string;
}

function rowToProfile(row: ProfileRow): ChildProfile {
  return {
    id: row.id,
    name: row.name,
    avatarUri: row.avatarUri ?? undefined,
    avatarColor: row.avatarColor,
    preferences: JSON.parse(row.preferences),
    createdAt: row.createdAt,
  };
}

export async function getProfiles(): Promise<ChildProfile[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ProfileRow>('SELECT * FROM profiles ORDER BY createdAt ASC');
  return rows.map(rowToProfile);
}

/**
 * Reemplaza la lista completa de perfiles, igual comportamiento observable
 * que la implementación anterior sobre AsyncStorage (`ProfilesContext`
 * siempre pasa el array completo, nunca un delta).
 */
export async function saveProfiles(profiles: ChildProfile[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM profiles');
    for (const profile of profiles) {
      await db.runAsync(
        'INSERT INTO profiles (id, name, avatarUri, avatarColor, preferences, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        profile.id,
        profile.name,
        profile.avatarUri ?? null,
        profile.avatarColor,
        JSON.stringify(profile.preferences),
        profile.createdAt,
      );
    }
  });
}

export async function getActiveProfileId(): Promise<string | null> {
  return getSetting('activeProfileId');
}

export async function setActiveProfileId(id: string | null): Promise<void> {
  await setSetting('activeProfileId', id);
}
