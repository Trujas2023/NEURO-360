import { createId } from '@shared/utils/id';
import { colors } from '@shared/theme';

import type { DailyRoutine } from '../types';

interface SeedRoutine {
  title: string;
  emoji: string;
  color: string;
  steps: { label: string; emoji: string }[];
}

/**
 * Rutinas iniciales, sembradas solo la primera vez que se abre Mi Día de
 * un perfil (ver `useRoutines`). Los perfiles creados antes de esta fase
 * conservan las rutinas que ya tengan guardadas: la siembra no vuelve a
 * ejecutarse ni sobrescribe nada.
 */
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
  {
    title: 'Bañarme',
    emoji: '🛁',
    color: colors.accent,
    steps: [
      { label: 'Quitarme la ropa', emoji: '👕' },
      { label: 'Abrir el agua', emoji: '🚿' },
      { label: 'Lavarme el cuerpo', emoji: '🧼' },
      { label: 'Lavarme el pelo', emoji: '🧴' },
      { label: 'Enjuagarme', emoji: '💧' },
      { label: 'Secarme', emoji: '🧺' },
      { label: 'Vestirme', emoji: '👚' },
    ],
  },
  {
    title: 'Comer',
    emoji: '🍽️',
    color: colors.warning,
    steps: [
      { label: 'Lavarme las manos', emoji: '🧼' },
      { label: 'Sentarme a la mesa', emoji: '🪑' },
      { label: 'Comer', emoji: '🍽️' },
      { label: 'Tomar agua', emoji: '💧' },
      { label: 'Llevar mi plato', emoji: '🧽' },
    ],
  },
  {
    title: 'Ir al baño',
    emoji: '🚽',
    color: colors.success,
    steps: [
      { label: 'Ir al baño', emoji: '🚪' },
      { label: 'Bajarme la ropa', emoji: '👖' },
      { label: 'Sentarme', emoji: '🚽' },
      { label: 'Limpiarme', emoji: '🧻' },
      { label: 'Subirme la ropa', emoji: '👖' },
      { label: 'Lavarme las manos', emoji: '🧼' },
    ],
  },
  {
    title: 'Salir de casa',
    emoji: '🚪',
    color: colors.secondary,
    steps: [
      { label: 'Ir al baño', emoji: '🚽' },
      { label: 'Ponerme los zapatos', emoji: '👟' },
      { label: 'Ponerme el abrigo', emoji: '🧥' },
      { label: 'Tomar mis cosas', emoji: '🎒' },
      { label: 'Salir', emoji: '🚪' },
    ],
  },
  {
    title: 'Llegar a casa',
    emoji: '🏠',
    color: colors.blush,
    steps: [
      { label: 'Quitarme los zapatos', emoji: '👟' },
      { label: 'Guardar mis cosas', emoji: '🎒' },
      { label: 'Lavarme las manos', emoji: '🧼' },
      { label: 'Descansar un rato', emoji: '🛋️' },
    ],
  },
  {
    title: 'Ir a terapia',
    emoji: '🧩',
    color: colors.primaryDark,
    steps: [
      { label: 'Prepararme', emoji: '👕' },
      { label: 'Tomar mis cosas', emoji: '🎒' },
      { label: 'Viajar', emoji: '🚌' },
      { label: 'Saludar', emoji: '👋' },
      { label: 'Trabajar y jugar', emoji: '🧩' },
      { label: 'Volver a casa', emoji: '🏠' },
    ],
  },
  {
    title: 'Ir al médico',
    emoji: '🩺',
    color: colors.danger,
    steps: [
      { label: 'Prepararme', emoji: '👕' },
      { label: 'Viajar', emoji: '🚗' },
      { label: 'Esperar mi turno', emoji: '🪑' },
      { label: 'Entrar con el médico', emoji: '🩺' },
      { label: 'Volver a casa', emoji: '🏠' },
    ],
  },
  {
    title: 'Ir a la escuela',
    emoji: '🏫',
    color: colors.accent,
    steps: [
      { label: 'Viajar', emoji: '🚌' },
      { label: 'Entrar al salón', emoji: '🚪' },
      { label: 'Saludar', emoji: '👋' },
      { label: 'Trabajar', emoji: '✏️' },
      { label: 'Recreo', emoji: '⚽' },
      { label: 'Volver a casa', emoji: '🏠' },
    ],
  },
];

/** Genera las rutinas iniciales de un perfil nuevo (una sola vez, ver `useRoutines`). */
export function buildDefaultRoutines(profileId: string): DailyRoutine[] {
  const now = new Date().toISOString();

  return SEED_ROUTINES.map((seed, routineIndex) => ({
    id: createId(),
    profileId,
    title: seed.title,
    emoji: seed.emoji,
    color: seed.color,
    order: routineIndex,
    displayMode: 'list' as const,
    createdAt: now,
    updatedAt: now,
    steps: seed.steps.map((step, stepIndex) => ({
      id: createId(),
      label: step.label,
      emoji: step.emoji,
      done: false,
      order: stepIndex,
    })),
  }));
}
