import { createId } from '@shared/utils/id';
import { colors } from '@shared/theme';

import type { DailyRoutine } from '../types';

interface SeedRoutine {
  title: string;
  emoji: string;
  color: string;
  steps: { label: string; emoji: string }[];
}

/** Rutinas iniciales, sembradas solo la primera vez que se abre Mi Día de un perfil. */
const SEED_ROUTINES: SeedRoutine[] = [
  {
    title: 'Prepararme para la escuela',
    emoji: '🎒',
    color: colors.primary,
    steps: [
      { label: 'Levantarme', emoji: '🛏️' },
      { label: 'Ir al baño', emoji: '🚽' },
      { label: 'Vestirme', emoji: '👕' },
      { label: 'Desayunar', emoji: '🥣' },
      { label: 'Tomar mochila', emoji: '🎒' },
      { label: 'Ir a la escuela', emoji: '🏫' },
    ],
  },
  {
    title: 'Ir a dormir',
    emoji: '🌙',
    color: colors.lavender,
    steps: [
      { label: 'Bañarme', emoji: '🛁' },
      { label: 'Ponerme el pijama', emoji: '🩱' },
      { label: 'Cepillarme los dientes', emoji: '🪥' },
      { label: 'Leer un cuento', emoji: '📖' },
      { label: 'Dormir', emoji: '😴' },
    ],
  },
];

/** Genera las rutinas iniciales de un perfil nuevo (una sola vez, ver `useRoutines`). */
export function buildDefaultRoutines(): DailyRoutine[] {
  return SEED_ROUTINES.map((seed, routineIndex) => ({
    id: createId(),
    title: seed.title,
    emoji: seed.emoji,
    color: seed.color,
    order: routineIndex,
    createdAt: new Date().toISOString(),
    steps: seed.steps.map((step, stepIndex) => ({
      id: createId(),
      label: step.label,
      emoji: step.emoji,
      done: false,
      order: stepIndex,
    })),
  }));
}
