import type { AppMode } from '@shared/constants/app';

/**
 * Tipos compartidos de dominio. Se amplían en fases posteriores
 * (comunicador AAC en Fase 3-4, perfiles en Fase 2, juegos en Fase 6-7).
 * Se definen aquí ya para que la arquitectura de carpetas quede fijada
 * desde la Fase 1.
 */

export interface ChildProfilePreferences {
  /** Si está apagado, el comunicador y los juegos deben evitar sonido (Fase 3+). */
  soundEnabled: boolean;
  /** Si está activo, las pantallas deben minimizar animaciones (Fase 6+). */
  reduceMotion: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  /** Foto elegida por un adulto. Si falta, se muestra un avatar con inicial y avatarColor. */
  avatarUri?: string;
  avatarColor: string;
  preferences: ChildProfilePreferences;
  createdAt: string;
}

export type { AppMode };
