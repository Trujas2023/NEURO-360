import { colors } from '@shared/theme';

import type { AacCategory } from '../types';

/** Id especial: no es una categoría real, filtra tarjetas con isFavorite = true. */
export const FAVORITES_CATEGORY_ID = 'favorites';
/** Id especial: tarjetas activas ordenadas por `usageCount` descendente. */
export const MOST_USED_CATEGORY_ID = 'mostUsed';
/** Id especial: tarjetas activas ordenadas por `lastUsedAt` descendente. */
export const RECENT_CATEGORY_ID = 'recent';

/** Ids que no son categorías reales (no aparecen en el editor ni agrupan tarjetas propias). */
export const VIRTUAL_CATEGORY_IDS: readonly string[] = [
  FAVORITES_CATEGORY_ID,
  MOST_USED_CATEGORY_ID,
  RECENT_CATEGORY_ID,
];

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
  { id: MOST_USED_CATEGORY_ID, label: 'Más usados', emoji: '🔥' },
  { id: RECENT_CATEGORY_ID, label: 'Recientes', emoji: '🕐' },
  // Categorías originales (Fase 3-4): no se cambian ids ni etiquetas para
  // no dejar huérfanas tarjetas ya guardadas en dispositivos de prueba.
  { id: 'food', label: 'Comida', emoji: '🍎' },
  { id: 'drinks', label: 'Bebidas', emoji: '🥤' },
  { id: 'want', label: 'Quiero', emoji: '❤️' },
  { id: 'dontWant', label: 'No quiero', emoji: '🚫' },
  { id: 'emotions', label: 'Emociones', emoji: '😊' },
  { id: 'hurts', label: 'Dolor', emoji: '🤕' },
  { id: 'bathroom', label: 'Baño', emoji: '🚽' },
  { id: 'places', label: 'Lugares', emoji: '🏠' },
  { id: 'people', label: 'Personas', emoji: '👨‍👩‍👧' },
  { id: 'activities', label: 'Actividades', emoji: '🎮' },
  { id: 'needs', label: 'Necesidades', emoji: '🛏️' },
  { id: 'help', label: 'Ayuda', emoji: '🆘' },
  // Categorías profesionales agregadas en "Mi Voz AAC Pro" (Fase 2 de esta
  // rama) para cubrir la lista mínima del prompt maestro.
  { id: 'actions', label: 'Acciones', emoji: '🏃' },
  { id: 'school', label: 'Escuela', emoji: '🏫' },
  { id: 'home', label: 'Casa', emoji: '🛋️' },
  { id: 'play', label: 'Juego', emoji: '🧩' },
  { id: 'objects', label: 'Objetos', emoji: '🧸' },
  { id: 'animals', label: 'Animales', emoji: '🐶' },
  { id: 'clothing', label: 'Ropa', emoji: '👕' },
  { id: 'routines', label: 'Rutinas', emoji: '🗓️' },
  { id: 'emergency', label: 'Emergencia', emoji: '🚨' },
  { id: 'social', label: 'Palabras sociales', emoji: '🤝' },
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

/** Categorías reales para elegir al crear/editar una tarjeta (excluye Favoritos/Más usados/Recientes). */
export const ASSIGNABLE_CATEGORIES: AacCategory[] = AAC_CATEGORIES.filter(
  (category) => !VIRTUAL_CATEGORY_IDS.includes(category.id),
);
