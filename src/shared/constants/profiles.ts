import { colors } from '@shared/theme';
import type { ChildProfilePreferences, CommunicationLevel } from '@shared/types';

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
  ttsRate: 1,
  ttsPitch: 1,
};

/** Nivel de comunicación por defecto: AAC completo (comportamiento histórico). */
export const DEFAULT_COMMUNICATION_LEVEL: CommunicationLevel = 'LEVEL_4';

export const COMMUNICATION_LEVELS: { value: CommunicationLevel; label: string; description: string }[] = [
  { value: 'LEVEL_1', label: 'Nivel 1', description: '2 a 4 opciones grandes, habla inmediata' },
  { value: 'LEVEL_2', label: 'Nivel 2', description: '6 a 12 tarjetas núcleo, sin categorías' },
  { value: 'LEVEL_3', label: 'Nivel 3', description: 'Vocabulario núcleo + categorías' },
  { value: 'LEVEL_4', label: 'Nivel 4', description: 'Comunicador AAC completo' },
];

/** Cantidad de dígitos del PIN de Modo Adulto. */
export const ADULT_PIN_LENGTH = 4;
