import { useCallback, useEffect, useMemo, useState } from 'react';

import { createId } from '@shared/utils/id';

import { buildDefaultRoutines } from '../data/defaultRoutines';
import { getRoutines, saveRoutines } from '../storage/routinesRepository';
import type {
  CreateRoutineInput,
  CreateStepInput,
  DailyRoutine,
  RoutineStep,
  UpdateRoutineInput,
  UpdateStepInput,
} from '../types';

export interface UseRoutinesResult {
  routines: DailyRoutine[];
  loading: boolean;
  reload: () => Promise<void>;
  createRoutine: (input: CreateRoutineInput) => Promise<DailyRoutine>;
  updateRoutine: (id: string, updates: UpdateRoutineInput) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  /** Copia una rutina con todos sus pasos (sin marcar como hechos), al final de la lista. */
  duplicateRoutine: (id: string) => Promise<void>;
  moveRoutine: (id: string, direction: 'up' | 'down') => Promise<void>;
  addStep: (routineId: string, input: CreateStepInput) => Promise<void>;
  updateStep: (routineId: string, stepId: string, updates: UpdateStepInput) => Promise<void>;
  deleteStep: (routineId: string, stepId: string) => Promise<void>;
  moveStep: (routineId: string, stepId: string, direction: 'up' | 'down') => Promise<void>;
  toggleStepDone: (routineId: string, stepId: string) => Promise<void>;
  resetRoutine: (routineId: string) => Promise<void>;
}

async function loadRoutinesForProfile(profileId: string): Promise<DailyRoutine[]> {
  const stored = await getRoutines(profileId);
  if (stored === null) {
    const seeded = buildDefaultRoutines(profileId);
    await saveRoutines(profileId, seeded);
    return seeded;
  }
  return stored;
}

/** Datos y acciones de las rutinas "Mi Día" de un perfil concreto, con siembra automática la primera vez. */
export function useRoutines(profileId: string | null): UseRoutinesResult {
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      if (!profileId) {
        if (isMounted) {
          setRoutines([]);
          setLoading(false);
        }
        return;
      }
      const result = await loadRoutinesForProfile(profileId);
      if (isMounted) {
        setRoutines(result);
        setLoading(false);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const reload = useCallback(async () => {
    if (!profileId) {
      setRoutines([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await loadRoutinesForProfile(profileId);
    setRoutines(result);
    setLoading(false);
  }, [profileId]);

  const persist = useCallback(
    async (next: DailyRoutine[]) => {
      setRoutines(next);
      if (profileId) {
        await saveRoutines(profileId, next);
      }
    },
    [profileId],
  );

  /** Aplica un cambio a una rutina y le refresca `updatedAt` de una sola vez. */
  const withRoutine = useCallback(
    (routineId: string, updater: (routine: DailyRoutine) => DailyRoutine) => {
      const now = new Date().toISOString();
      return routines.map((routine) =>
        routine.id === routineId ? { ...updater(routine), updatedAt: now } : routine,
      );
    },
    [routines],
  );

  const createRoutine = useCallback(
    async (input: CreateRoutineInput) => {
      const now = new Date().toISOString();
      const nextOrder = routines.reduce((max, routine) => Math.max(max, routine.order), -1) + 1;
      const routine: DailyRoutine = {
        id: createId(),
        profileId: profileId ?? undefined,
        title: input.title.trim(),
        emoji: input.emoji.trim() || '🗓️',
        color: input.color,
        order: nextOrder,
        displayMode: input.displayMode ?? 'list',
        steps: [],
        createdAt: now,
        updatedAt: now,
      };
      await persist([...routines, routine]);
      return routine;
    },
    [routines, persist, profileId],
  );

  const updateRoutine = useCallback(
    async (id: string, updates: UpdateRoutineInput) => {
      await persist(withRoutine(id, (routine) => ({ ...routine, ...updates })));
    },
    [withRoutine, persist],
  );

  const deleteRoutine = useCallback(
    async (id: string) => {
      await persist(routines.filter((routine) => routine.id !== id));
    },
    [routines, persist],
  );

  const duplicateRoutine = useCallback(
    async (id: string) => {
      const original = routines.find((routine) => routine.id === id);
      if (!original) {
        return;
      }
      const now = new Date().toISOString();
      const nextOrder = routines.reduce((max, routine) => Math.max(max, routine.order), -1) + 1;
      const copy: DailyRoutine = {
        ...original,
        id: createId(),
        title: `${original.title} (copia)`,
        order: nextOrder,
        createdAt: now,
        updatedAt: now,
        // Los pasos se copian sin el progreso del original: una rutina
        // recién duplicada empieza siempre desde cero.
        steps: original.steps.map((step) => ({ ...step, id: createId(), done: false })),
      };
      await persist([...routines, copy]);
    },
    [routines, persist],
  );

  const moveRoutine = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const sorted = [...routines].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((routine) => routine.id === id);
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) {
        return;
      }
      const target = sorted[index];
      const sibling = sorted[swapIndex];

      await persist(
        routines.map((routine) => {
          if (routine.id === target.id) {
            return { ...routine, order: sibling.order };
          }
          if (routine.id === sibling.id) {
            return { ...routine, order: target.order };
          }
          return routine;
        }),
      );
    },
    [routines, persist],
  );

  const addStep = useCallback(
    async (routineId: string, input: CreateStepInput) => {
      await persist(
        withRoutine(routineId, (routine) => {
          const nextOrder = routine.steps.reduce((max, step) => Math.max(max, step.order), -1) + 1;
          const step: RoutineStep = {
            id: createId(),
            label: input.label.trim(),
            emoji: input.emoji.trim() || '⭐',
            imageUri: input.imageUri,
            durationSeconds: input.durationSeconds,
            done: false,
            order: nextOrder,
          };
          return { ...routine, steps: [...routine.steps, step] };
        }),
      );
    },
    [withRoutine, persist],
  );

  const updateStep = useCallback(
    async (routineId: string, stepId: string, updates: UpdateStepInput) => {
      await persist(
        withRoutine(routineId, (routine) => ({
          ...routine,
          steps: routine.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
        })),
      );
    },
    [withRoutine, persist],
  );

  const deleteStep = useCallback(
    async (routineId: string, stepId: string) => {
      await persist(
        withRoutine(routineId, (routine) => ({
          ...routine,
          steps: routine.steps.filter((step) => step.id !== stepId),
        })),
      );
    },
    [withRoutine, persist],
  );

  const moveStep = useCallback(
    async (routineId: string, stepId: string, direction: 'up' | 'down') => {
      const routine = routines.find((item) => item.id === routineId);
      if (!routine) {
        return;
      }
      const steps = [...routine.steps].sort((a, b) => a.order - b.order);
      const index = steps.findIndex((step) => step.id === stepId);
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= steps.length) {
        return;
      }
      const target = steps[index];
      const sibling = steps[swapIndex];

      await persist(
        withRoutine(routineId, (item) => ({
          ...item,
          steps: item.steps.map((step) => {
            if (step.id === target.id) {
              return { ...step, order: sibling.order };
            }
            if (step.id === sibling.id) {
              return { ...step, order: target.order };
            }
            return step;
          }),
        })),
      );
    },
    [routines, withRoutine, persist],
  );

  const toggleStepDone = useCallback(
    async (routineId: string, stepId: string) => {
      await persist(
        withRoutine(routineId, (routine) => {
          const steps = routine.steps.map((step) =>
            step.id === stepId ? { ...step, done: !step.done } : step,
          );
          // Detecta la transición incompleta → completa (no al revés, ni al
          // seguir tocando pasos de una rutina que ya estaba completa) para
          // sumar `completedCount` una sola vez por vuelta (Fase 7I).
          const wasComplete = routine.steps.length > 0 && routine.steps.every((step) => step.done);
          const isComplete = steps.length > 0 && steps.every((step) => step.done);
          const justCompleted = isComplete && !wasComplete;
          return {
            ...routine,
            steps,
            completedCount: justCompleted ? (routine.completedCount ?? 0) + 1 : routine.completedCount,
            lastCompletedAt: justCompleted ? new Date().toISOString() : routine.lastCompletedAt,
          };
        }),
      );
    },
    [withRoutine, persist],
  );

  const resetRoutine = useCallback(
    async (routineId: string) => {
      await persist(
        withRoutine(routineId, (routine) => ({
          ...routine,
          steps: routine.steps.map((step) => ({ ...step, done: false })),
        })),
      );
    },
    [withRoutine, persist],
  );

  return useMemo(
    () => ({
      routines,
      loading,
      reload,
      createRoutine,
      updateRoutine,
      deleteRoutine,
      duplicateRoutine,
      moveRoutine,
      addStep,
      updateStep,
      deleteStep,
      moveStep,
      toggleStepDone,
      resetRoutine,
    }),
    [
      routines,
      loading,
      reload,
      createRoutine,
      updateRoutine,
      deleteRoutine,
      duplicateRoutine,
      moveRoutine,
      addStep,
      updateStep,
      deleteStep,
      moveStep,
      toggleStepDone,
      resetRoutine,
    ],
  );
}
