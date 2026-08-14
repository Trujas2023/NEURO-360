import type { QuickPhrase } from '@features/aac-communicator/types';
import { colors } from '@shared/theme';

/**
 * Frases de Calma 360: comunicación rápida para momentos de crisis o
 * sobreestimulación. Se reproducen de inmediato al tocarlas (no pasan por
 * la barra de frase): no hay tiempo para construir una oración en estos
 * casos.
 *
 * Dos de ellas (`detail`) abren además un flujo guiado opcional que
 * ayuda a precisar qué pasa: "Me duele" → dónde/cuánto/cómo se siente, y
 * "Tengo miedo" → qué te molesta/qué necesitas. Tocar la tarjeta sigue
 * hablando de inmediato; el flujo es un segundo paso, nunca obligatorio.
 */
const DEFINITIONS: Omit<QuickPhrase, 'color'>[] = [
  { id: 'calm-silence', label: 'Necesito silencio', emoji: '🤫' },
  { id: 'calm-rest', label: 'Necesito descansar', emoji: '🛏️' },
  { id: 'calm-hurts', label: 'Me duele', emoji: '🤕', detail: 'pain' },
  { id: 'calm-no-touch', label: 'No me toques', emoji: '🙅' },
  { id: 'calm-leave', label: 'Quiero salir', emoji: '🚪' },
  { id: 'calm-scared', label: 'Tengo miedo', emoji: '😨', detail: 'overwhelm' },
  { id: 'calm-angry', label: 'Estoy enojado', emoji: '😡' },
  { id: 'calm-sad', label: 'Estoy triste', emoji: '😢' },
  { id: 'calm-help', label: 'Necesito ayuda', emoji: '🆘' },
  { id: 'calm-headphones', label: 'Necesito mis audífonos', emoji: '🎧' },
  { id: 'calm-water', label: 'Necesito agua', emoji: '💧' },
  { id: 'calm-bathroom', label: 'Necesito ir al baño', emoji: '🚽' },
  { id: 'calm-alone', label: 'Quiero estar solo', emoji: '🧘' },
  { id: 'calm-mom', label: 'Llama a mamá', emoji: '👩' },
  { id: 'calm-dad', label: 'Llama a papá', emoji: '👨' },
];

const PALETTE = [colors.lavender, colors.accent, colors.blush, colors.primaryDark];

export const EMERGENCY_VOCABULARY: QuickPhrase[] = DEFINITIONS.map((definition, index) => ({
  ...definition,
  color: PALETTE[index % PALETTE.length],
}));
