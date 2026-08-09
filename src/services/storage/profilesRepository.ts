import type { ChildProfile } from '@shared/types';

import { getItem, setItem } from './asyncStorage';

const PROFILES_KEY = 'sense-play/profiles';
const ACTIVE_PROFILE_KEY = 'sense-play/active-profile-id';

export async function getProfiles(): Promise<ChildProfile[]> {
  const profiles = await getItem<ChildProfile[]>(PROFILES_KEY);
  return profiles ?? [];
}

export async function saveProfiles(profiles: ChildProfile[]): Promise<void> {
  await setItem(PROFILES_KEY, profiles);
}

export async function getActiveProfileId(): Promise<string | null> {
  return getItem<string>(ACTIVE_PROFILE_KEY);
}

export async function setActiveProfileId(id: string | null): Promise<void> {
  await setItem(ACTIVE_PROFILE_KEY, id);
}
