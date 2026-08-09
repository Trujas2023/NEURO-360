/**
 * Paleta provisional de Fase 1. Colores suaves y de bajo contraste agresivo,
 * pensados para evitar sobreestimulación visual. El diseño definitivo se
 * cierra en la Fase 10 (diseño definitivo); esta paleta solo fija los
 * tokens que el resto de la arquitectura puede consumir desde ya.
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
