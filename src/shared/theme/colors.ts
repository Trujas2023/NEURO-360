/**
 * Paleta de identidad Sense & Play: colores suaves y de bajo contraste
 * agresivo, pensados para evitar sobreestimulación visual (principio
 * validado y conservado desde la Fase 1). R1 agrega tokens semánticos
 * nuevos (ver docs/UX_UI_SYSTEM_SPEC.md §1.2) de forma aditiva: ningún
 * valor existente cambia.
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

  /** Tarjetas/paneles que deben distinguirse de `surface` plano (modales, hojas, Toast). */
  surfaceElevated: '#FFFFFF',
  /** Contorno de foco visible para navegación por teclado/switch externo. */
  focusRing: '#5E9C89',
  /** Estado deshabilitado consistente en todos los componentes interactivos. */
  disabledBackground: '#EFEAE0',
  disabledText: '#A8A29A',
  /** Fondo semitransparente detrás de diálogos/confirmaciones. */
  overlayScrim: 'rgba(58, 58, 58, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;
