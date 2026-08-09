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

/**
 * Idioma por defecto del texto a voz (Fase 3). Se guarda como constante
 * centralizada para que agregar selección de idioma por perfil en el
 * futuro solo implique leer ese valor desde las preferencias en vez de
 * este default fijo.
 */
export const DEFAULT_SPEECH_LANGUAGE = 'es-ES';
