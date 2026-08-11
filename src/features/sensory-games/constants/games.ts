import { colors } from '@shared/theme';

import type { AnimationSpeed, SensoryGameDefinition, SensoryPreferences, VisualLevel } from '../types';

/** No se depende únicamente del color: cada tarjeta también tiene emoji y texto (mismo criterio que el comunicador AAC). */
export const SENSORY_GAMES: SensoryGameDefinition[] = [
  { id: 'bubbles', label: 'Burbujas', emoji: '🫧', color: colors.accent },
  { id: 'magicColors', label: 'Colores mágicos', emoji: '🎨', color: colors.blush },
  { id: 'followTheLight', label: 'Sigue la luz', emoji: '✨', color: colors.warning },
  { id: 'touchAndListen', label: 'Toca y escucha', emoji: '🎵', color: colors.secondary },
  { id: 'calmWaves', label: 'Ondas calmantes', emoji: '🌊', color: colors.primary },
  { id: 'sensoryDrawing', label: 'Dibujo sensorial', emoji: '🖌️', color: colors.lavender },
];

export function getSensoryGame(id: string): SensoryGameDefinition | undefined {
  return SENSORY_GAMES.find((game) => game.id === id);
}

export const DEFAULT_SENSORY_PREFERENCES: SensoryPreferences = {
  vibrationEnabled: true,
  animationSpeed: 'normal',
  visualLevel: 'medium',
  sessionDurationMinutes: null,
  reducedStimulation: false,
};

/** Multiplicador de duración de animaciones: más alto = más lento (más calmo). */
export const ANIMATION_SPEED_MULTIPLIER: Record<AnimationSpeed, number> = {
  slow: 1.6,
  normal: 1,
  fast: 0.65,
};

/** Cuántos elementos simultáneos (burbujas, estrellas, etc.) admite cada nivel visual. */
export const VISUAL_LEVEL_DENSITY: Record<VisualLevel, number> = {
  low: 4,
  medium: 7,
  high: 11,
};
