/**
 * Tipografía base. Se usa la fuente del sistema por defecto en Fase 1;
 * la Fase 10 podrá incorporar una fuente redondeada/accesible personalizada
 * en assets/fonts sin cambiar la forma en que el resto de la app consume
 * estos tokens.
 */
export const typography = {
  fontFamily: undefined as string | undefined,
  sizes: {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '600' as const,
    bold: '700' as const,
  },
};
