import { colors } from '@shared/theme';

import type { QuickPhrase } from './emergencyVocabulary';

/**
 * Vocabulario esencial para Nivel 1 de comunicación (2-4 opciones
 * grandes): el conjunto mínimo con el que un comunicador que recién
 * empieza puede pedir, aceptar, rechazar y pedir ayuda. Cada palabra
 * habla de inmediato al tocarla (no pasa por la barra de frase, que en
 * Nivel 1 está oculta — ver `AacHomeScreen`).
 */
const DEFINITIONS: Omit<QuickPhrase, 'color'>[] = [
  { id: 'essential-si', label: 'Sí', emoji: '✅' },
  { id: 'essential-no', label: 'No', emoji: '❌' },
  { id: 'essential-mas', label: 'Más', emoji: '➕' },
  { id: 'essential-ayuda', label: 'Ayuda', emoji: '🆘' },
];

const PALETTE = [colors.success, colors.danger, colors.primary, colors.warning];

export const ESSENTIAL_VOCABULARY: QuickPhrase[] = DEFINITIONS.map((definition, index) => ({
  ...definition,
  color: PALETTE[index % PALETTE.length],
}));
