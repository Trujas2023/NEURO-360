/** Tipos de dominio de "Mundo Sensorial": actividades de regulación. */

/**
 * Actividades implementadas. `sounds` (sonidos ambientales) todavía no
 * está: necesita archivos de audio con licencia que el repositorio no
 * tiene (`assets/sounds/` está vacío). No se declara acá para que no
 * pueda aparecer en la navegación a medio hacer — ver README del módulo.
 */
export type SensoryActivityId = 'bubbles' | 'breathing' | 'tracking' | 'paint' | 'causeEffect';

/** Con qué frecuencia aparecen burbujas / cuánto estímulo hay en pantalla. */
export type SensoryIntensity = 'low' | 'medium' | 'high';

/** Ritmo de respiración en segundos: inhalar - mantener - exhalar. */
export type BreathingPattern = '3-3-4' | '4-4-4' | '4-2-6';

export type TrackingSpeed = 'verySlow' | 'slow' | 'medium';

export type PaintMode = 'stroke' | 'particles' | 'glow' | 'shapes';

export interface SensorySettings {
  /** Vibración suave al tocar. Se ignora si el dispositivo no la admite. */
  hapticsEnabled: boolean;
  bubbleIntensity: SensoryIntensity;
  breathingPattern: BreathingPattern;
  trackingSpeed: TrackingSpeed;
  /** Color del objeto de seguimiento visual. */
  trackingColor: string;
  paintMode: PaintMode;
}

/** Segundos de cada fase, derivados del patrón elegido. */
export const BREATHING_TIMINGS: Record<BreathingPattern, { inhale: number; hold: number; exhale: number }> = {
  '3-3-4': { inhale: 3, hold: 3, exhale: 4 },
  '4-4-4': { inhale: 4, hold: 4, exhale: 4 },
  '4-2-6': { inhale: 4, hold: 2, exhale: 6 },
};

/** Milisegundos entre burbujas nuevas. */
export const BUBBLE_SPAWN_MS: Record<SensoryIntensity, number> = {
  low: 2200,
  medium: 1400,
  high: 800,
};

/** Milisegundos que tarda el objeto en cruzar la pantalla. */
export const TRACKING_DURATION_MS: Record<TrackingSpeed, number> = {
  verySlow: 9000,
  slow: 6000,
  medium: 4000,
};
