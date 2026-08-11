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

/**
 * v0.2: se consolidan las categorías de la Fase 3 (13) en las 10 pedidas
 * por el módulo "Mi Voz" completo. "Comida" + "Bebidas" se unen en
 * `foodDrink`; "Quiero" + "No quiero" se unen en `yesNo`; "Baño" y
 * "Ayuda" dejan de ser categorías propias (sus tarjetas pasan a
 * `places`/`needs`/`quickPhrases`, ver `seedCards.ts`); se agrega
 * `quickPhrases` ("Frases rápidas"). Ningún perfil real usaba todavía
 * estas categorías en un dispositivo (la app aún no se probó fuera de
 * este entorno), así que renombrar los ids no deja datos huérfanos.
 */
const DEFINITIONS: Omit<AacCategory, 'color'>[] = [
  { id: FAVORITES_CATEGORY_ID, label: 'Favoritos', emoji: '⭐' },
  { id: 'needs', label: 'Necesidades', emoji: '🛏️' },
  { id: 'foodDrink', label: 'Comida y bebida', emoji: '🍎' },
  { id: 'emotions', label: 'Emociones', emoji: '😊' },
  { id: 'people', label: 'Personas', emoji: '👨‍👩‍👧' },
  { id: 'places', label: 'Lugares', emoji: '🏠' },
  { id: 'activities', label: 'Actividades', emoji: '🎮' },
  { id: 'hurts', label: 'Dolor / malestar', emoji: '🤕' },
  { id: 'yesNo', label: 'Sí / No', emoji: '✅' },
  { id: 'quickPhrases', label: 'Frases rápidas', emoji: '💬' },
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
