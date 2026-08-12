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

export const DEFAULT_PROFILE_PREFERENCES: ChildProfilePreferences = {
  soundEnabled: true,
  reduceMotion: false,
  speakOnTap: true,
  boardSize: '3x3',
  textSize: 'medium',
  showCardText: true,
  showCardImage: true,
  showCardColor: true,
  showFavorites: true,
  showMostUsed: true,
  showPhraseBar: true,
  showCategories: true,
  confirmBeforeDelete: true,
};

/** Cantidad de dígitos del PIN de Modo Adulto. */
export const ADULT_PIN_LENGTH = 4;
