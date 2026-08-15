/**
 * Registro de migraciones de datos heredados de AsyncStorage, un feature a
 * la vez. Mismo patrón que `profileDataRegistry.ts` (registro por efecto de
 * import): cada repositorio con datos propios por perfil (tarjetas AAC,
 * rutinas) se registra aquí una sola vez, para que `migrateFromAsyncStorage.ts`
 * (dentro de `services/storage`) no necesite importar código de
 * `features/*` directamente — `services` nunca depende de `features`.
 */
type LegacyMigration = (profileIds: string[]) => Promise<void>;

const migrations: LegacyMigration[] = [];

export function registerLegacyMigration(migration: LegacyMigration): void {
  migrations.push(migration);
}

export async function runLegacyMigrations(profileIds: string[]): Promise<void> {
  await Promise.all(migrations.map((migration) => migration(profileIds)));
}
