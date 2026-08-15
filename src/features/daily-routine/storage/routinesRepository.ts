import { getItem } from '@services/storage/asyncStorage';
import { getDb, getSetting, setSetting } from '@services/storage/db';
import { registerLegacyMigration } from '@services/storage/migrationRegistry';
import { registerProfileDataCleanup } from '@services/storage/profileDataRegistry';

import type { DailyRoutine, RoutineStep } from '../types';

function legacyRoutinesKey(profileId: string): string {
  return `sense-play/daily-routine/routines/${profileId}`;
}

interface RoutineRow {
  id: string;
  profileId: string;
  title: string;
  emoji: string;
  color: string;
  orderNum: number;
  createdAt: string;
}

interface RoutineStepRow {
  id: string;
  routineId: string;
  label: string;
  emoji: string;
  done: number;
  orderNum: number;
}

function seededKey(profileId: string): string {
  return `routinesSeeded:${profileId}`;
}

function rowToStep(row: RoutineStepRow): RoutineStep {
  return {
    id: row.id,
    label: row.label,
    emoji: row.emoji,
    done: row.done === 1,
    order: row.orderNum,
  };
}

/**
 * `null` significa "nunca se guardó nada para este perfil" (primera vez,
 * corresponde sembrar las rutinas por defecto). Un array vacío `[]`
 * significa que el adulto eliminó todas las rutinas a propósito. Misma
 * semántica que la implementación anterior sobre AsyncStorage, marcada con
 * `routinesSeeded:<id>` en `kv_settings` (ver aacCardsRepository.ts).
 */
export async function getRoutines(profileId: string): Promise<DailyRoutine[] | null> {
  const seeded = await getSetting(seededKey(profileId));
  if (!seeded) {
    return null;
  }
  const db = await getDb();
  const routineRows = await db.getAllAsync<RoutineRow>(
    'SELECT * FROM routines WHERE profileId = ? ORDER BY orderNum ASC',
    profileId,
  );
  const routines: DailyRoutine[] = [];
  for (const routineRow of routineRows) {
    const stepRows = await db.getAllAsync<RoutineStepRow>(
      'SELECT * FROM routine_steps WHERE routineId = ? ORDER BY orderNum ASC',
      routineRow.id,
    );
    routines.push({
      id: routineRow.id,
      title: routineRow.title,
      emoji: routineRow.emoji,
      color: routineRow.color,
      order: routineRow.orderNum,
      createdAt: routineRow.createdAt,
      steps: stepRows.map(rowToStep),
    });
  }
  return routines;
}

export async function saveRoutines(profileId: string, routines: DailyRoutine[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'DELETE FROM routine_steps WHERE routineId IN (SELECT id FROM routines WHERE profileId = ?)',
      profileId,
    );
    await db.runAsync('DELETE FROM routines WHERE profileId = ?', profileId);
    for (const routine of routines) {
      await db.runAsync(
        'INSERT INTO routines (id, profileId, title, emoji, color, orderNum, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        routine.id,
        profileId,
        routine.title,
        routine.emoji,
        routine.color,
        routine.order,
        routine.createdAt,
      );
      for (const step of routine.steps) {
        await db.runAsync(
          'INSERT INTO routine_steps (id, routineId, label, emoji, done, orderNum) VALUES (?, ?, ?, ?, ?, ?)',
          step.id,
          routine.id,
          step.label,
          step.emoji,
          step.done ? 1 : 0,
          step.order,
        );
      }
    }
  });
  await setSetting(seededKey(profileId), '1');
}

export async function removeRoutines(profileId: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'DELETE FROM routine_steps WHERE routineId IN (SELECT id FROM routines WHERE profileId = ?)',
      profileId,
    );
    await db.runAsync('DELETE FROM routines WHERE profileId = ?', profileId);
  });
  await setSetting(seededKey(profileId), null);
}

// Borra las rutinas de Mi Día del perfil cuando `ProfilesContext` elimina
// ese perfil, para no dejar datos huérfanos en la base de datos.
registerProfileDataCleanup(removeRoutines);

// Migra las rutinas guardadas en AsyncStorage hacia SQLite, una sola vez
// por perfil heredado (ver services/storage/migrateFromAsyncStorage.ts).
registerLegacyMigration(async (profileIds) => {
  for (const profileId of profileIds) {
    const legacyRoutines = await getItem<DailyRoutine[]>(legacyRoutinesKey(profileId));
    if (legacyRoutines) {
      await saveRoutines(profileId, legacyRoutines);
    }
  }
});
