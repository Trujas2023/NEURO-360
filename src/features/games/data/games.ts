import { colors } from '@shared/theme';

import type { GameId } from '../types';

export interface GameDefinition {
  id: GameId;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

/** Catálogo de juegos, en orden de menor a mayor demanda cognitiva. */
export const GAMES: GameDefinition[] = [
  { id: 'colors', label: 'Colores', emoji: '🎨', color: colors.blush, description: 'Emparejar colores iguales' },
  { id: 'shapes', label: 'Formas', emoji: '🔷', color: colors.accent, description: 'Emparejar figuras iguales' },
  { id: 'emotions', label: 'Emociones', emoji: '😊', color: colors.warning, description: 'Reconocer cómo se siente' },
  { id: 'categories', label: 'Clasificar', emoji: '🧺', color: colors.primary, description: 'Agrupar por categoría' },
  { id: 'memory', label: 'Memoria', emoji: '🧠', color: colors.lavender, description: 'Encontrar las parejas' },
  { id: 'sequence', label: 'Secuencias', emoji: '🔢', color: colors.success, description: 'Repetir el orden' },
];
