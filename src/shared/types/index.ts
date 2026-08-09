import type { AppMode } from '@shared/constants/app';

/**
 * Tipos compartidos de dominio. Se amplían en fases posteriores
 * (comunicador AAC en Fase 3-4, perfiles en Fase 2, juegos en Fase 6-7).
 * Se definen aquí ya para que la arquitectura de carpetas quede fijada
 * desde la Fase 1.
 */

export interface ChildProfile {
  id: string;
  name: string;
  avatarUri?: string;
  createdAt: string;
}

export type { AppMode };
