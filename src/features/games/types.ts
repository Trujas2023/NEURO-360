/** Tipos de dominio de "Juega & Regula". */

export type GameId = 'colors' | 'shapes' | 'memory' | 'sequence' | 'emotions' | 'categories';

export type GameDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Duración de una partida medida en **rondas, no en segundos**: un
 * cronómetro en cuenta regresiva es exactamente el tipo de presión que
 * el proyecto quiere evitar. El niño siempre termina la ronda que
 * empezó, tarde lo que tarde.
 */
export type GameSessionLength = 'short' | 'medium' | 'long';

export interface GameSettings {
  difficulty: GameDifficulty;
  sessionLength: GameSessionLength;
  /** Voz de apoyo: lee la consigna y celebra los aciertos (usa el TTS del dispositivo). */
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

/** Cuántas opciones se ofrecen por ronda en los juegos de emparejar. */
export const OPTIONS_BY_DIFFICULTY: Record<GameDifficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

/** Cuántas rondas dura una partida. */
export const ROUNDS_BY_LENGTH: Record<GameSessionLength, number> = {
  short: 4,
  medium: 6,
  long: 10,
};

/** Parejas del juego de memoria. */
export const MEMORY_PAIRS_BY_DIFFICULTY: Record<GameDifficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

/** Largo de la secuencia a reproducir. */
export const SEQUENCE_LENGTH_BY_DIFFICULTY: Record<GameDifficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};
