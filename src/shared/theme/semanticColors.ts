import { colors } from './colors';

/**
 * Capa semántica sobre `colors`: para elegir un color por su *rol* en la
 * interfaz (éxito, advertencia, calma…) en vez de por su nombre de
 * paleta. `colors` sigue siendo la fuente de verdad de los valores; este
 * módulo solo les da un nombre de uso. No reemplaza a `colors`, lo
 * complementa.
 */
export const semanticColors = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.accent,
  /** Acento de los módulos de regulación (Calma, Mundo Sensorial). */
  calm: colors.lavender,
  /** Estados activos/seleccionados (tab activo, chip elegido). */
  focus: colors.primary,
  /** Único uso admitido para llamar la atención sin ser una alarma (p. ej. favorito). */
  attention: colors.blush,
} as const;

export type SemanticColorToken = keyof typeof semanticColors;
