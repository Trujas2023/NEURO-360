/**
 * Tipografía del design system (R1, ver docs/UX_UI_SYSTEM_SPEC.md §1.1).
 * Familia Atkinson Hyperlegible (SIL Open Font License, uso comercial
 * permitido con atribución), elegida por legibilidad en baja visión —
 * empaquetada en assets/fonts y cargada por `useAppFonts` (shared/hooks).
 *
 * `sizes`/`weights` (Fase 1) se conservan sin cambios para no romper las
 * pantallas existentes: son un subconjunto de la escala nueva de abajo.
 */
export const typography = {
  fontFamily: 'AtkinsonHyperlegible-Regular' as string | undefined,
  fontFamilyBold: 'AtkinsonHyperlegible-Bold' as string | undefined,
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
  /** Escala tipográfica completa (UX_UI_SYSTEM_SPEC.md §1.1). */
  scale: {
    display: { fontSize: 40, lineHeight: 52 },
    h1: { fontSize: 32, lineHeight: 42 },
    h2: { fontSize: 24, lineHeight: 32 },
    bodyLg: { fontSize: 20, lineHeight: 27 },
    body: { fontSize: 18, lineHeight: 24 },
    bodySm: { fontSize: 15, lineHeight: 20 },
    caption: { fontSize: 13, lineHeight: 18 },
  },
} as const;

export type TypographyScaleToken = keyof typeof typography.scale;
