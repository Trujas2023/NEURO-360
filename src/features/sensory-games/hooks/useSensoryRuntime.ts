import { useProfiles } from '@features/profiles/context/ProfilesContext';

import { ANIMATION_SPEED_MULTIPLIER, VISUAL_LEVEL_DENSITY } from '../constants/games';
import { useSensoryPreferences } from './useSensoryPreferences';

export interface SensoryRuntimeSettings {
  loading: boolean;
  profileId: string | null;
  /** Silencio general del perfil (Fase 2, ya existente); ningún juego reproduce sonido si está apagado. */
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  /** `true` si `reduceMotion` (perfil) o `reducedStimulation` (sensorial) están activos. */
  reduceMotion: boolean;
  /** Multiplicador de duración de animaciones: más alto = más lento. Ya incorpora `reduceMotion`. */
  speedMultiplier: number;
  /** Cuántos elementos simultáneos mostrar (burbujas, estrellas, etc.). Ya reducido si `reducedStimulation`. */
  maxElements: number;
  sessionDurationMinutes: number | null;
}

/**
 * Combina las preferencias generales del perfil (`ChildProfilePreferences`,
 * Fase 2) con los ajustes propios de Mundo Sensorial en valores listos para
 * usar en cada juego, para no repetir esta lógica seis veces.
 */
export function useSensoryRuntime(): SensoryRuntimeSettings {
  const { activeProfile, loading: profilesLoading } = useProfiles();
  const { preferences, loading: sensoryLoading } = useSensoryPreferences(activeProfile?.id ?? null);

  const reduceMotion = (activeProfile?.preferences.reduceMotion ?? false) || preferences.reducedStimulation;
  const baseSpeed = ANIMATION_SPEED_MULTIPLIER[preferences.animationSpeed];
  const baseDensity = VISUAL_LEVEL_DENSITY[preferences.visualLevel];

  return {
    loading: profilesLoading || sensoryLoading,
    profileId: activeProfile?.id ?? null,
    soundEnabled: activeProfile?.preferences.soundEnabled ?? true,
    vibrationEnabled: preferences.vibrationEnabled,
    reduceMotion,
    speedMultiplier: reduceMotion ? baseSpeed * 1.4 : baseSpeed,
    maxElements: preferences.reducedStimulation ? Math.min(baseDensity, 4) : baseDensity,
    sessionDurationMinutes: preferences.sessionDurationMinutes,
  };
}
