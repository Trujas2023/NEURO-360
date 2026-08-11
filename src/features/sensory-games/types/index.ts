/**
 * Tipos de dominio de "Juega & Regula" / Mundo Sensorial. Son locales a
 * este feature (no a `shared/types`): las preferencias de sonido general
 * y reducción de movimiento ya existentes en `ChildProfilePreferences`
 * (Fase 2) se siguen reutilizando tal cual desde ahí; acá solo viven los
 * ajustes propios de los juegos sensoriales, para no mezclar su lógica
 * con la del comunicador AAC.
 */

export type SensoryGameId =
  | 'bubbles'
  | 'magicColors'
  | 'followTheLight'
  | 'touchAndListen'
  | 'calmWaves'
  | 'sensoryDrawing';

export interface SensoryGameDefinition {
  id: SensoryGameId;
  label: string;
  emoji: string;
  color: string;
}

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type VisualLevel = 'low' | 'medium' | 'high';

export interface SensoryPreferences {
  /** Vibración háptica opcional en juegos que la ofrecen (burbujas, sigue la luz). */
  vibrationEnabled: boolean;
  /** Velocidad general de las animaciones de los juegos. */
  animationSpeed: AnimationSpeed;
  /** Cuánta variedad visual (colores, cantidad de elementos) se muestra a la vez. */
  visualLevel: VisualLevel;
  /** Minutos de sesión sugeridos antes de mostrar un aviso para descansar; `null` = sin límite. */
  sessionDurationMinutes: number | null;
  /**
   * Modo reducido de estímulos: además de `reduceMotion` (que ya minimiza
   * animaciones), baja la cantidad de elementos simultáneos y prioriza
   * colores suaves en todos los juegos.
   */
  reducedStimulation: boolean;
}

// Juego 2 — Colores mágicos
export type MagicColorsShapeType = 'circle' | 'blob';
export type MagicColorsPalette = 'soft' | 'vivid';

// Juego 3 — Sigue la luz
export type FollowLightTrajectory = 'horizontal' | 'vertical' | 'circular' | 'random';

// Juego 5 — Ondas calmantes
export type CalmWavesMode = 'water' | 'stars' | 'circles' | 'softLight';
