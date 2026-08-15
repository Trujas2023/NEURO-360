import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getAacCards, saveAacCards } from '@features/aac-communicator/storage/aacCardsRepository';
import { getSavedPhrases, saveSavedPhrases } from '@features/aac-communicator/storage/savedPhrasesRepository';
import type { AacCard, SavedPhrase } from '@features/aac-communicator/types';
import { getRoutines, saveRoutines } from '@features/daily-routine/storage/routinesRepository';
import type { DailyRoutine } from '@features/daily-routine/types';
import { getGameSettings, saveGameSettings } from '@features/games/storage/gameSettingsRepository';
import type { GameSettings } from '@features/games/types';
import { getSensorySettings, saveSensorySettings } from '@features/sensory-world/storage/sensorySettingsRepository';
import type { SensorySettings } from '@features/sensory-world/types';
import { getActiveProfileId, getProfiles, saveProfiles, setActiveProfileId } from '@services/storage/profilesRepository';
import type { ChildProfile } from '@shared/types';

/**
 * Respaldo local de todo lo que se puede reconstruir desde AsyncStorage:
 * perfiles, tarjetas AAC, frases guardadas, rutinas y ajustes de Mundo
 * Sensorial/Juegos. Todo queda en un único archivo JSON que el adulto
 * guarda donde quiera (Drive, almacenamiento del teléfono, etc.) — nunca
 * se sube a ningún servidor propio de la app.
 *
 * Deliberadamente NO incluye:
 * - El PIN de adulto (barrera parental en texto plano; no vale la pena el
 *   riesgo de que quede guardado en un archivo que se puede compartir por
 *   error). Si falta tras restaurar, `PinGateScreen` simplemente pide
 *   crear uno nuevo la próxima vez — no es un error.
 * - Los archivos de audio de las grabaciones de voz de Mi Voz (binarios
 *   pesados; incluirlos es una decisión de una fase futura con su propio
 *   análisis de tamaño, no algo que se pueda decidir a la ligera acá). El
 *   `audioUri` de una tarjeta se conserva en el JSON, así que si el
 *   archivo ya no existe en el dispositivo, la tarjeta cae a TTS sola
 *   (mismo comportamiento que si se hubiera borrado el archivo por
 *   cualquier otro motivo — ver `utils/cardSpeech.ts`).
 */
const SCHEMA_VERSION = 1;

interface ProfileBackupData {
  aacCards: AacCard[] | null;
  savedPhrases: SavedPhrase[];
  routines: DailyRoutine[] | null;
  sensorySettings: SensorySettings;
  gameSettings: GameSettings;
}

interface BackupFile {
  schemaVersion: number;
  exportedAt: string;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  profileData: Record<string, ProfileBackupData>;
}

function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<BackupFile>;
  return candidate.schemaVersion === SCHEMA_VERSION && Array.isArray(candidate.profiles) && !!candidate.profileData;
}

/**
 * Junta todo, escribe un archivo temporal y abre el selector nativo de
 * "compartir/guardar" de Android. Si el dispositivo no tiene ninguna app
 * para recibirlo (`isAvailableAsync` en `false`, muy raro), deja el
 * archivo escrito igual y lo informa quien llama.
 */
export async function exportBackup(): Promise<{ shared: boolean }> {
  const profiles = await getProfiles();
  const activeProfileId = await getActiveProfileId();

  const profileData: Record<string, ProfileBackupData> = {};
  for (const profile of profiles) {
    profileData[profile.id] = {
      aacCards: await getAacCards(profile.id),
      savedPhrases: await getSavedPhrases(profile.id),
      routines: await getRoutines(profile.id),
      sensorySettings: await getSensorySettings(profile.id),
      gameSettings: await getGameSettings(profile.id),
    };
  }

  const backup: BackupFile = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profiles,
    activeProfileId,
    profileData,
  };

  const fileName = `sense-play-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(JSON.stringify(backup, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    return { shared: false };
  }
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Guardar respaldo' });
  return { shared: true };
}

/** Abre el selector de archivos, valida el JSON elegido y lo deja listo para restaurar (no escribe nada todavía). */
export async function pickBackupFile(): Promise<BackupFile | null> {
  const picked = await File.pickFileAsync({ mimeTypes: 'application/json' });
  if (picked.canceled || !picked.result) {
    return null;
  }

  const text = await picked.result.text();
  const parsed: unknown = JSON.parse(text);
  if (!isBackupFile(parsed)) {
    throw new Error('El archivo elegido no es un respaldo válido de esta app.');
  }
  return parsed;
}

/**
 * Sobrescribe perfiles, tarjetas, frases, rutinas y ajustes con los del
 * respaldo. Quien llama es responsable de haber confirmado con el adulto
 * antes: esto reemplaza los datos actuales del dispositivo sin vuelta
 * atrás (salvo que tenga otro respaldo).
 */
export async function restoreBackup(backup: BackupFile): Promise<{ profileCount: number }> {
  await saveProfiles(backup.profiles);
  await setActiveProfileId(backup.activeProfileId ?? null);

  for (const profile of backup.profiles) {
    const data = backup.profileData[profile.id];
    if (!data) {
      continue;
    }
    if (data.aacCards) {
      await saveAacCards(profile.id, data.aacCards);
    }
    await saveSavedPhrases(profile.id, data.savedPhrases ?? []);
    if (data.routines) {
      await saveRoutines(profile.id, data.routines);
    }
    if (data.sensorySettings) {
      await saveSensorySettings(profile.id, data.sensorySettings);
    }
    if (data.gameSettings) {
      await saveGameSettings(profile.id, data.gameSettings);
    }
  }

  return { profileCount: backup.profiles.length };
}
