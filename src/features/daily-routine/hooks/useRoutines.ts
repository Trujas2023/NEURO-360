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
    const seeded = buildDefaultRoutines();
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

  const withRoutine = useCallback(
    (routineId: string, updater: (routine: DailyRoutine) => DailyRoutine) =>
      routines.map((routine) => (routine.id === routineId ? updater(routine) : routine)),
    [routines],
  );

  const createRoutine = useCallback(
    async (input: CreateRoutineInput) => {
      const nextOrder = routines.reduce((max, routine) => Math.max(max, routine.order), -1) + 1;
      const routine: DailyRoutine = {
        id: createId(),
        title: input.title.trim(),
        emoji: input.emoji.trim() || '🗓️',
        color: input.color,
        order: nextOrder,
        steps: [],
        createdAt: new Date().toISOString(),
      };
      await persist([...routines, routine]);
      return routine;
    },
    [routines, persist],
  );

  const updateRoutine = useCallback(
    async (id: string, updates: UpdateRoutineInput) => {
      await persist(routines.map((routine) => (routine.id === id ? { ...routine, ...updates } : routine)));
    },
    [routines, persist],
  );

  const deleteRoutine = useCallback(
    async (id: string) => {
      await persist(routines.filter((routine) => routine.id !== id));
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
        withRoutine(routineId, (routine) => ({
          ...routine,
          steps: routine.steps.map((step) => (step.id === stepId ? { ...step, done: !step.done } : step)),
        })),
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
      addStep,
      updateStep,
      deleteStep,
      moveStep,
      toggleStepDone,
      resetRoutine,
    ],
  );
}
