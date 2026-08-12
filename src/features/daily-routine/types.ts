/** Tipos de dominio de "Mi Día": agenda visual de rutinas y pasos. */

export interface RoutineStep {
  id: string;
  label: string;
  emoji: string;
  /** Se reinicia manualmente (botón "Reiniciar rutina"); no hay reset automático por día. */
  done: boolean;
  /** Orden dentro de su rutina; menor va primero. */
  order: number;
}

export interface DailyRoutine {
  id: string;
  title: string;
  emoji: string;
  color: string;
  steps: RoutineStep[];
  /** Orden entre rutinas del perfil; menor va primero. */
  order: number;
  createdAt: string;
}

export type CreateRoutineInput = {
  title: string;
  emoji: string;
  color: string;
};

export type UpdateRoutineInput = Partial<Pick<DailyRoutine, 'title' | 'emoji' | 'color'>>;

export type CreateStepInput = {
  label: string;
  emoji: string;
};

export type UpdateStepInput = Partial<Pick<RoutineStep, 'label' | 'emoji'>>;
