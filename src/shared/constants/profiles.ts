import { colors } from '@shared/theme';
import type { ChildProfilePreferences } from '@shared/types';

/** Paleta de colores para el avatar por iniciales cuando no hay foto. */
export const AVATAR_COLORS: readonly string[] = [
  colors.primary,
  colors.secondary,
  colors.accent,
  colors.lavender,
  colors.blush,
  colors.warning,
];

/**
 * Modo recomendado por defecto (Módulo 9): botones grandes, imagen + texto
 * grande, alto contraste (colores del tema) y bordes redondeados
 * (`shared/theme/spacing.radius`).
 */
export const DEFAULT_PROFILE_PREFERENCES: ChildProfilePreferences = {
  soundEnabled: true,
  reduceMotion: false,
  speakOnTap: true,
  cardSize: 'large',
  displayMode: 'imageTextLarge',
  columns: 'auto',
};

/** Cantidad de dígitos del PIN de Modo Adulto. */
export const ADULT_PIN_LENGTH = 4;
