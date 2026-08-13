/**
 * Tamaños de área táctil. El estándar de accesibilidad móvil pide un
 * mínimo de 48x48dp; esta app los usa como piso, no como objetivo, y
 * prefiere `comfortable`/`large` en controles pensados para el niño.
 * `minTouchTarget` (`spacing.ts`) se mantiene como estaba (64dp, alias de
 * `touchTargets.large`) para no romper los componentes que ya lo usan.
 */
export const touchTargets = {
  /** Piso de accesibilidad general (íconos secundarios, controles de adulto). */
  minimum: 48,
  /** Uso por defecto en botones y tarjetas de Modo Niño. */
  comfortable: 56,
  /** Controles principales (acciones esenciales: Ayuda, Hablar, tarjetas AAC). */
  large: 64,
} as const;
