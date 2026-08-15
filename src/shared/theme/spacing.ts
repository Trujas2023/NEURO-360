/**
 * Escala de espaciado compartida. Los botones y tarjetas del comunicador y
 * los juegos deben ser grandes y con área táctil amplia: se evita usar
 * valores por debajo de `sm` para elementos interactivos.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/** Área táctil mínima recomendada (dp) para botones usados por niños. */
export const minTouchTarget = 64;

/** Separadores finos (R1, ver docs/UX_UI_SYSTEM_SPEC.md §1.3). */
export const hairline = 1;

/** Elementos hero: burbuja de respiración, iconos de resultado (R1). */
export const heroSize = 96;
