import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  getActiveProfileId,
  getProfiles,
  saveProfiles,
  setActiveProfileId as persistActiveProfileId,
} from '@services/storage';
import { cleanupProfileData } from '@services/storage/profileDataRegistry';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import type { ChildProfile, ChildProfilePreferences } from '@shared/types';
import { createId } from '@shared/utils/id';

export interface CreateProfileInput {
  name: string;
  avatarUri?: string;
  avatarColor: string;
  preferences?: ChildProfilePreferences;
}

export type UpdateProfileInput = Partial<Omit<ChildProfile, 'id' | 'createdAt'>>;

interface ProfilesContextValue {
  profiles: ChildProfile[];
  activeProfileId: string | null;
  activeProfile: ChildProfile | null;
  loading: boolean;
  createProfile: (input: CreateProfileInput) => Promise<ChildProfile>;
  updateProfile: (id: string, updates: UpdateProfileInput) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  selectProfile: (id: string) => Promise<void>;
}

const ProfilesContext = createContext<ProfilesContextValue | undefined>(undefined);

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const [storedProfiles, storedActiveId] = await Promise.all([getProfiles(), getActiveProfileId()]);
      if (!isMounted) {
        return;
      }
      setProfiles(storedProfiles);
      setActiveProfileId(storedActiveId && storedProfiles.some((p) => p.id === storedActiveId) ? storedActiveId : null);
      setLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const createProfile = useCallback(async (input: CreateProfileInput) => {
    const profile: ChildProfile = {
      id: createId(),
      name: input.name.trim(),
      avatarUri: input.avatarUri,
      avatarColor: input.avatarColor,
      preferences: input.preferences ?? DEFAULT_PROFILE_PREFERENCES,
      createdAt: new Date().toISOString(),
    };

    setProfiles((current) => {
      const next = [...current, profile];
      saveProfiles(next);
      return next;
    });

    return profile;
  }, []);

  const updateProfile = useCallback(async (id: string, updates: UpdateProfileInput) => {
    setProfiles((current) => {
      const next = current.map((profile) => (profile.id === id ? { ...profile, ...updates } : profile));
      saveProfiles(next);
      return next;
    });
  }, []);

  const deleteProfile = useCallback(
    async (id: string) => {
      setProfiles((current) => {
        const next = current.filter((profile) => profile.id !== id);
        saveProfiles(next);
        return next;
      });

      // Borra también, de forma aislada, cualquier dato guardado exclusivamente
      // para este perfil (tarjetas AAC hoy; otros datos por perfil en el futuro),
      // sin tocar el almacenamiento de ningún otro perfil.
      await cleanupProfileData(id);

      if (activeProfileId === id) {
        setActiveProfileId(null);
        await persistActiveProfileId(null);
      }
    },
    [activeProfileId],
  );

  const selectProfile = useCallback(async (id: string) => {
    setActiveProfileId(id);
    await persistActiveProfileId(id);
  }, []);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId) ?? null,
    [profiles, activeProfileId],
  );

  const value = useMemo<ProfilesContextValue>(
    () => ({
      profiles,
      activeProfileId,
      activeProfile,
      loading,
      createProfile,
      updateProfile,
      deleteProfile,
      selectProfile,
    }),
    [profiles, activeProfileId, activeProfile, loading, createProfile, updateProfile, deleteProfile, selectProfile],
  );

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfiles(): ProfilesContextValue {
  const context = useContext(ProfilesContext);
  if (!context) {
    throw new Error('useProfiles debe usarse dentro de un ProfilesProvider');
  }
  return context;
}
