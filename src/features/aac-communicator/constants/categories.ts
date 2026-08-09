import { colors } from '@shared/theme';

import type { AacCategory } from '../types';

/** Id especial: no es una categoría real, filtra tarjetas con isFavorite = true. */
export const FAVORITES_CATEGORY_ID = 'favorites';

const PALETTE = [
  colors.warning,
  colors.blush,
  colors.accent,
  colors.primary,
  colors.danger,
  colors.lavender,
  colors.secondary,
  colors.success,
  colors.primaryDark,
];

const DEFINITIONS: Omit<AacCategory, 'color'>[] = [
  { id: FAVORITES_CATEGORY_ID, label: 'Favoritos', emoji: '⭐' },
  { id: 'food', label: 'Comida', emoji: '🍎' },
  { id: 'drinks', label: 'Bebidas', emoji: '🥤' },
  { id: 'want', label: 'Quiero', emoji: '❤️' },
  { id: 'dontWant', label: 'No quiero', emoji: '🚫' },
  { id: 'emotions', label: 'Emociones', emoji: '😊' },
  { id: 'hurts', label: 'Me duele', emoji: '🤕' },
  { id: 'bathroom', label: 'Baño', emoji: '🚽' },
  { id: 'places', label: 'Lugares', emoji: '🏠' },
  { id: 'people', label: 'Personas', emoji: '👨‍👩‍👧' },
  { id: 'activities', label: 'Actividades', emoji: '🎮' },
  { id: 'needs', label: 'Necesidades', emoji: '🛏️' },
  { id: 'help', label: 'Ayuda', emoji: '🆘' },
];

/**
 * No se depende únicamente del color para distinguir categorías: cada una
 * también tiene su propio emoji y etiqueta de texto. El color solo aporta
 * un refuerzo visual adicional.
 */
export const AAC_CATEGORIES: AacCategory[] = DEFINITIONS.map((definition, index) => ({
  ...definition,
  color: PALETTE[index % PALETTE.length],
}));

export function getCategory(categoryId: string): AacCategory | undefined {
  return AAC_CATEGORIES.find((category) => category.id === categoryId);
}

/** Categorías reales para elegir al crear/editar una tarjeta (excluye "Favoritos"). */
export const ASSIGNABLE_CATEGORIES: AacCategory[] = AAC_CATEGORIES.filter(
  (category) => category.id !== FAVORITES_CATEGORY_ID,
);
