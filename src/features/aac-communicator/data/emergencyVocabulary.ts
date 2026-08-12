import { colors } from '@shared/theme';

export interface QuickPhrase {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

/**
 * Frases de Calma 360: comunicación rápida para momentos de crisis o
 * sobreestimulación. Se reproducen de inmediato al tocarlas (no pasan por
 * la barra de frase): no hay tiempo para construir una oración en estos
 * casos.
 */
const DEFINITIONS: Omit<QuickPhrase, 'color'>[] = [
  { id: 'calm-silence', label: 'Necesito silencio', emoji: '🤫' },
  { id: 'calm-rest', label: 'Necesito descansar', emoji: '🛏️' },
  { id: 'calm-hurts', label: 'Me duele', emoji: '🤕' },
  { id: 'calm-no-touch', label: 'No me toques', emoji: '🙅' },
  { id: 'calm-leave', label: 'Quiero salir', emoji: '🚪' },
  { id: 'calm-scared', label: 'Tengo miedo', emoji: '😨' },
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
