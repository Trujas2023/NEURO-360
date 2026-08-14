import { colors } from '@shared/theme';

/**
 * Opciones del flujo "Tengo miedo / Estoy saturado". Cada una guarda su
 * propia oración ya redactada (en vez de armarla concatenando etiquetas),
 * porque en español "Ruido" y "Muchas personas" no encajan en la misma
 * plantilla: "Me molesta el ruido" vs. "Hay muchas personas".
 */
export interface OverwhelmOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  sentence: string;
}

/** ¿Qué te molesta? */
export const OVERWHELM_TRIGGERS: OverwhelmOption[] = [
  { id: 'noise', label: 'Ruido', emoji: '🔊', sentence: 'Me molesta el ruido.' },
  { id: 'light', label: 'Luz', emoji: '💡', sentence: 'Me molesta la luz.' },
  { id: 'people', label: 'Muchas personas', emoji: '👥', sentence: 'Hay muchas personas.' },
  { id: 'touch', label: 'Que me toquen', emoji: '🤚', sentence: 'No quiero que me toquen.' },
  { id: 'place', label: 'Este lugar', emoji: '📍', sentence: 'No me gusta este lugar.' },
  { id: 'change', label: 'Algo cambió', emoji: '🔄', sentence: 'Algo cambió y no me gusta.' },
  { id: 'unknown', label: 'No sé', emoji: '🤷', sentence: 'Algo me molesta y no sé qué es.' },
].map((option, index) => ({
  ...option,
  color: [colors.warning, colors.accent, colors.blush, colors.lavender][index % 4],
}));

/** ¿Qué necesitas? */
export const OVERWHELM_NEEDS: OverwhelmOption[] = [
  { id: 'headphones', label: 'Audífonos', emoji: '🎧', sentence: 'Necesito mis audífonos.' },
  { id: 'silence', label: 'Silencio', emoji: '🤫', sentence: 'Necesito silencio.' },
  { id: 'leave', label: 'Salir', emoji: '🚪', sentence: 'Quiero salir de aquí.' },
  { id: 'rest', label: 'Descansar', emoji: '🛏️', sentence: 'Necesito descansar.' },
  { id: 'adult', label: 'Mi adulto', emoji: '🧑', sentence: 'Quiero a mi adulto.' },
  { id: 'breathe', label: 'Respirar', emoji: '🌬️', sentence: 'Quiero respirar despacio.' },
  { id: 'water', label: 'Agua', emoji: '💧', sentence: 'Necesito agua.' },
].map((option, index) => ({
  ...option,
  color: [colors.primary, colors.success, colors.accent, colors.lavender][index % 4],
}));

/** Arma la frase final, p. ej. "Me molesta el ruido. Necesito mis audífonos." */
export function buildOverwhelmSentence(trigger: OverwhelmOption, need: OverwhelmOption): string {
  return `${trigger.sentence} ${need.sentence}`;
}
