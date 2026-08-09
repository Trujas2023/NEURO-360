/**
 * Registro de limpieza de datos por perfil. Cuando se elimina un perfil,
 * `ProfilesContext` llama a `cleanupProfileData(profileId)` sin necesitar
 * saber qué features guardan datos propios de ese perfil (tarjetas AAC
 * hoy; grabaciones de voz, progreso de juegos, etc. en fases futuras).
 * Cada feature con almacenamiento aislado por perfil se registra aquí una
 * sola vez (efecto de import), evitando que `profiles` tenga que importar
 * a esos features directamente y datos huérfanos en AsyncStorage.
 */
type ProfileDataCleanup = (profileId: string) => Promise<void>;

const cleanups: ProfileDataCleanup[] = [];

export function registerProfileDataCleanup(cleanup: ProfileDataCleanup): void {
  cleanups.push(cleanup);
}

export async function cleanupProfileData(profileId: string): Promise<void> {
  await Promise.all(cleanups.map((cleanup) => cleanup(profileId)));
}
