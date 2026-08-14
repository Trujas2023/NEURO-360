import { colors } from '@shared/theme';
import type { QuickPhrase } from '@features/aac-communicator/types';

/**
 * Frases del botón de Ayuda global (distinto de Calma 360: este es un
 * conjunto más corto, pensado para "algo va mal y necesito a un adulto ya
 * mismo", alcanzable en 1 toque desde cualquier módulo principal).
 */
const DEFINITIONS: Omit<QuickPhrase, 'color'>[] = [
  { id: 'help-need-help', label: 'Necesito ayuda', emoji: '🆘' },
  { id: 'help-hurts', label: 'Me duele', emoji: '🤕' },
  { id: 'help-scared', label: 'Tengo miedo', emoji: '😨' },
  { id: 'help-lost', label: 'Me perdí', emoji: '❓' },
  { id: 'help-want-adult', label: 'Quiero a mi adulto', emoji: '🧑' },
  { id: 'help-leave', label: 'Necesito salir', emoji: '🚪' },
];

const PALETTE = [colors.danger, colors.warning, colors.accent, colors.primaryDark];

export const HELP_VOCABULARY: QuickPhrase[] = DEFINITIONS.map((definition, index) => ({
  ...definition,
  color: PALETTE[index % PALETTE.length],
}));
