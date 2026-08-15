import * as SQLite from 'expo-sqlite';

/**
 * Motor de datos estructurados de la app (R1, ver docs/PRODUCT_MASTER_SPEC.md §7.3).
 * Reemplaza a AsyncStorage como fuente de verdad para perfiles, tarjetas AAC,
 * rutinas y ajustes escalares (PIN, perfil activo). `asyncStorage.ts` se
 * conserva únicamente como origen de lectura para la migración de datos de
 * instalaciones previas (`migrateFromAsyncStorage.ts`), nunca como destino
 * de escritura nueva.
 */

const DATABASE_NAME = 'sense-play.db';
const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function openDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  return openDb();
}

async function createSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS kv_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      avatarUri TEXT,
      avatarColor TEXT NOT NULL,
      preferences TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS aac_cards (
      id TEXT PRIMARY KEY NOT NULL,
      profileId TEXT NOT NULL,
      categoryId TEXT NOT NULL,
      label TEXT NOT NULL,
      emoji TEXT NOT NULL,
      imageUri TEXT,
      audioUri TEXT,
      color TEXT NOT NULL,
      isFavorite INTEGER NOT NULL DEFAULT 0,
      orderNum INTEGER NOT NULL DEFAULT 0,
      usageCount INTEGER,
      lastUsedAt TEXT,
      active INTEGER,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_aac_cards_profile ON aac_cards(profileId);

    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY NOT NULL,
      profileId TEXT NOT NULL,
      title TEXT NOT NULL,
      emoji TEXT NOT NULL,
      color TEXT NOT NULL,
      orderNum INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_routines_profile ON routines(profileId);

    CREATE TABLE IF NOT EXISTS routine_steps (
      id TEXT PRIMARY KEY NOT NULL,
      routineId TEXT NOT NULL,
      label TEXT NOT NULL,
      emoji TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      orderNum INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_routine_steps_routine ON routine_steps(routineId);
  `);
}

let initPromise: Promise<void> | null = null;

/**
 * Crea el esquema si no existe y dispara la migración de datos heredados de
 * AsyncStorage (una sola vez). Debe esperarse antes de montar la navegación
 * (`RootApp.tsx`) para que ningún repositorio lea una base vacía por error.
 */
export function initializeStorage(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await openDb();
      await createSchema(db);
      await setSetting('schemaVersion', String(SCHEMA_VERSION));
      const { migrateFromAsyncStorageIfNeeded } = await import('./migrateFromAsyncStorage');
      await migrateFromAsyncStorageIfNeeded();
    })();
  }
  return initPromise;
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string | null }>(
    'SELECT value FROM kv_settings WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO kv_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}
