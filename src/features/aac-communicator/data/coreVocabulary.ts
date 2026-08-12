import { colors } from '@shared/theme';

import type { AacCard, CoreWord } from '../types';

/**
 * Vocabulario núcleo de "Mi Voz AAC Pro": palabras de alta frecuencia,
 * siempre visibles arriba de las categorías (no dependen de ninguna
 * categoría ni perfil). Estructura de datos pura para poder ampliarla sin
 * tocar componentes (ver `CoreVocabularyRow`).
 */
const DEFINITIONS: Omit<CoreWord, 'color'>[] = [
  { id: 'core-yo', label: 'Yo', emoji: '🙋' },
  { id: 'core-tu', label: 'Tú', emoji: '🫵' },
  { id: 'core-quiero', label: 'Quiero', emoji: '❤️' },
  { id: 'core-no-quiero', label: 'No quiero', emoji: '🚫' },
  { id: 'core-si', label: 'Sí', emoji: '✅' },
  { id: 'core-no', label: 'No', emoji: '❌' },
  { id: 'core-mas', label: 'Más', emoji: '➕' },
  { id: 'core-termine', label: 'Terminé', emoji: '🏁' },
  { id: 'core-ayuda', label: 'Ayuda', emoji: '🆘' },
  { id: 'core-ir', label: 'Ir', emoji: '🚶' },
  { id: 'core-ven', label: 'Ven', emoji: '👋' },
  { id: 'core-dar', label: 'Dar', emoji: '🤲' },
  { id: 'core-hacer', label: 'Hacer', emoji: '🛠️' },
  { id: 'core-ver', label: 'Ver', emoji: '👀' },
  { id: 'core-escuchar', label: 'Escuchar', emoji: '👂' },
  { id: 'core-aqui', label: 'Aquí', emoji: '📍' },
  { id: 'core-alla', label: 'Allá', emoji: '🧭' },
  { id: 'core-ahora', label: 'Ahora', emoji: '⏱️' },
  { id: 'core-despues', label: 'Después', emoji: '⏭️' },
  { id: 'core-bueno', label: 'Bueno', emoji: '👍' },
  { id: 'core-malo', label: 'Malo', emoji: '👎' },
  { id: 'core-grande', label: 'Grande', emoji: '🔼' },
  { id: 'core-pequeno', label: 'Pequeño', emoji: '🔽' },
  { id: 'core-otro', label: 'Otro', emoji: '🔁' },
];

const PALETTE = [colors.primary, colors.accent, colors.secondary, colors.lavender];

export const CORE_VOCABULARY: CoreWord[] = DEFINITIONS.map((definition, index) => ({
  ...definition,
  color: PALETTE[index % PALETTE.length],
}));

/** Convierte una palabra núcleo en una tarjeta efímera: no se persiste, solo sirve para hablar/agregar a la frase. */
export function coreWordToCard(word: CoreWord): AacCard {
  return {
    id: word.id,
    categoryId: 'core',
    label: word.spokenText ?? word.label,
    emoji: word.emoji,
    color: word.color,
    isFavorite: false,
    order: 0,
    createdAt: '',
  };
}
