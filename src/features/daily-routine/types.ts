/** Tipos de dominio de "Mi Día": agenda visual de rutinas y pasos. */

/**
 * Cómo se le presenta la rutina al niño. Lo elige un adulto por rutina
 * (Centro Adulto → Mi Día), porque el apoyo visual que funciona depende
 * de la persona, no de la actividad:
 * - `list`: todos los pasos a la vez (comportamiento histórico).
 * - `firstThen`: tablero PRIMERO / DESPUÉS, solo dos pasos a la vez.
 * - `nowNextDone`: AHORA / DESPUÉS / TERMINADO.
 */
export type RoutineDisplayMode = 'list' | 'firstThen' | 'nowNextDone';

export interface RoutineStep {
  id: string;
  label: string;
  emoji: string;
  /** Foto elegida por un adulto (expo-image-picker). Si existe, reemplaza al emoji. */
  imageUri?: string;
  /**
   * Grabación de voz de un adulto (reservado para cuando se agregue
   * grabación de audio, igual que en `AacCard.audioUri`). Hoy los pasos
   * se leen con texto a voz.
   */
  audioUri?: string;
  /** Se reinicia manualmente (botón "Reiniciar rutina"); no hay reset automático por día. */
  done: boolean;
  /** Orden dentro de su rutina; menor va primero. */
  order: number;
  /** Duración opcional del paso; habilita el temporizador visual (ver `VisualTimer`). */
  durationSeconds?: number;
}

export interface DailyRoutine {
  id: string;
  /**
   * Perfil dueño de la rutina. Redundante con la clave de almacenamiento
   * (que ya es por perfil), pero deja la rutina auto-descriptiva para el
   * respaldo local de fases posteriores. Opcional por compatibilidad con
   * rutinas guardadas antes de esta fase.
   */
  profileId?: string;
  title: string;
  emoji: string;
  color: string;
  steps: RoutineStep[];
  /** Orden entre rutinas del perfil; menor va primero. */
  order: number;
  /** Opcional por compatibilidad; se lee como `?? 'list'` (comportamiento histórico). */
  displayMode?: RoutineDisplayMode;
  createdAt: string;
  /** Se actualiza en cada cambio de la rutina o de sus pasos. */
  updatedAt?: string;
}

export type CreateRoutineInput = {
  title: string;
  emoji: string;
  color: string;
  displayMode?: RoutineDisplayMode;
};

export type UpdateRoutineInput = Partial<
  Pick<DailyRoutine, 'title' | 'emoji' | 'color' | 'displayMode'>
>;

export type CreateStepInput = {
  label: string;
  emoji: string;
  imageUri?: string;
  durationSeconds?: number;
};

export type UpdateStepInput = Partial<
  Pick<RoutineStep, 'label' | 'emoji' | 'imageUri' | 'durationSeconds'>
>;
