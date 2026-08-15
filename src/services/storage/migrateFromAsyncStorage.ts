import type { ChildProfile } from '@shared/types';

import { getItem } from './asyncStorage';
import { getSetting, setSetting } from './db';
import { runLegacyMigrations } from './migrationRegistry';
import { hashPin } from './pinHash';
import { setAdultPinHashDirect } from './pinRepository';
import { saveProfiles, setActiveProfileId } from './profilesRepository';

const MIGRATED_FLAG = 'migratedFromAsyncStorageV1';

const LEGACY_PROFILES_KEY = 'sense-play/profiles';
const LEGACY_ACTIVE_PROFILE_KEY = 'sense-play/active-profile-id';
const LEGACY_PIN_KEY = 'sense-play/adult-pin';

/**
 * Migración de una sola vez desde AsyncStorage (Fase 1-4 / Mi Voz AAC Pro)
 * hacia SQLite (R1). Idempotente: se detiene de inmediato si ya corrió una
 * vez en este dispositivo. Si no había ninguna instalación previa (app
 * nueva), simplemente marca la migración como hecha sin escribir nada.
 */
export async function migrateFromAsyncStorageIfNeeded(): Promise<void> {
  const already = await getSetting(MIGRATED_FLAG);
  if (already) {
    return;
  }

  const legacyProfiles = await getItem<ChildProfile[]>(LEGACY_PROFILES_KEY);
  if (legacyProfiles && legacyProfiles.length > 0) {
    await saveProfiles(legacyProfiles);

    const legacyActiveId = await getItem<string>(LEGACY_ACTIVE_PROFILE_KEY);
    if (legacyActiveId) {
      await setActiveProfileId(legacyActiveId);
    }

    await runLegacyMigrations(legacyProfiles.map((profile) => profile.id));
  }

  const legacyPin = await getItem<string>(LEGACY_PIN_KEY);
  if (legacyPin) {
    const { randomUUID } = await import('expo-crypto');
    const salt = randomUUID();
    const hash = await hashPin(legacyPin, salt);
    await setAdultPinHashDirect(hash, salt);
  }

  await setSetting(MIGRATED_FLAG, '1');
}
