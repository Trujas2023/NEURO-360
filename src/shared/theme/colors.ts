/**
 * Paleta definitiva V7. Colores suaves y de bajo contraste agresivo,
 * pensados para evitar sobreestimulación visual — validada en la Fase 7C
 * (Design System) mediante cálculo de contraste WCAG contra cada
 * combinación de texto que la usa, no solo elegida por apariencia.
 *
 * Ningún tono de esta paleta es lo bastante oscuro para llevar texto
 * blanco (`onPrimary`) encima con contraste aceptable — están pensados
 * como fondo con texto oscuro (`textPrimary`) encima, nunca al revés.
 * `onPrimary` se mantiene solo para el día que exista una superficie
 * realmente oscura/saturada (no hay ninguna hoy); no debe volver a
 * combinarse con ningún tono de esta lista.
 */
export const colors = {
  background: '#FDF6EC',
  surface: '#FFFFFF',
  primary: '#7FB8A4',
  primaryDark: '#5E9C89',
  secondary: '#F7C59F',
  accent: '#8EA7E0',
  textPrimary: '#3A3A3A',
  textSecondary: '#6B6B6B',
  success: '#8FBF7F',
  warning: '#E8B86D',
  danger: '#E08C8C',
  border: '#E5DFD3',
  lavender: '#B9A7E0',
  blush: '#F0AFC0',
  onPrimary: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;
