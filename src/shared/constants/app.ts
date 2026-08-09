export const APP_NAME = 'Sense & Play Adventures 360';

/**
 * Modos de la aplicación. El Modo Adulto se protege con PIN (Fase 8) y da
 * acceso a configuración; el Modo Niño solo expone comunicador y juegos.
 */
export const APP_MODES = {
  child: 'child',
  adult: 'adult',
} as const;

export type AppMode = (typeof APP_MODES)[keyof typeof APP_MODES];
