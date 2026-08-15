import { colors } from '@shared/theme';

import type { SensoryActivityId, SensorySettings } from '../types';

/**
 * La entrada a Mundo Sensorial no pregunta "¿qué actividad querés?" sino
 * "¿qué necesitás ahora?": el niño rara vez sabe cómo se llama la
 * actividad, pero sí puede reconocer qué le está pasando. Cada necesidad
 * lleva directo a una actividad, así nada queda a más de dos toques.
 */
export interface SensoryNeed {
  id: string;
  label: string;
  emoji: string;
  color: string;
  activity: SensoryActivityId;
}

export const SENSORY_NEEDS: SensoryNeed[] = [
  { id: 'calm', label: 'Calma', emoji: '🫧', color: colors.accent, activity: 'bubbles' },
  { id: 'breathe', label: 'Respirar', emoji: '🌬️', color: colors.primary, activity: 'breathing' },
  { id: 'look', label: 'Mirar', emoji: '👀', color: colors.lavender, activity: 'tracking' },
  { id: 'touch', label: 'Tocar', emoji: '🎨', color: colors.blush, activity: 'paint' },
  { id: 'move', label: 'Movimiento', emoji: '✨', color: colors.warning, activity: 'causeEffect' },
  { id: 'listen', label: 'Escuchar', emoji: '🎵', color: colors.success, activity: 'soundRhythm' },
  { id: 'explore', label: 'Explorar', emoji: '🐠', color: colors.secondary, activity: 'aquarium' },
];

export const DEFAULT_SENSORY_SETTINGS: SensorySettings = {
  hapticsEnabled: true,
  bubbleIntensity: 'medium',
  breathingPattern: '4-4-4',
  trackingSpeed: 'slow',
  trackingColor: colors.accent,
  paintMode: 'stroke',
};

/** Paleta compartida por pintura, burbujas y causa-efecto: pastel con contraste suficiente. */
export const SENSORY_PALETTE: string[] = [
  colors.accent,
  colors.primary,
  colors.lavender,
  colors.blush,
  colors.warning,
  colors.success,
];
