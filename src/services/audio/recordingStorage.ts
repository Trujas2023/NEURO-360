import { Directory, File, Paths } from 'expo-file-system';

import { createId } from '@shared/utils/id';

/**
 * Grabaciones de voz personalizadas (tarjetas AAC). Viven en el
 * directorio de documentos de la app — almacenamiento privado y
 * persistente que sobrevive cierres de la app, reinicios del
 * dispositivo y actualizaciones normales desde Google Play — nunca en
 * el directorio de caché, que el sistema operativo puede vaciar en
 * cualquier momento sin avisar.
 *
 * Todo queda en el dispositivo: esta capa nunca sube nada a red ni
 * conoce ninguna URL remota.
 */
const RECORDINGS_DIR_NAME = 'aac-recordings';

function getRecordingsDirectory(): Directory {
  const directory = new Directory(Paths.document, RECORDINGS_DIR_NAME);
  if (!directory.exists) {
    directory.create({ intermediates: true });
  }
  return directory;
}

/**
 * Mueve la grabación recién hecha (que `expo-audio` escribe en una
 * ubicación temporal) al almacenamiento persistente de la app, con un
 * nombre de archivo propio. Devuelve el URI definitivo para guardar en
 * `AacCard.audioUri`.
 */
export async function persistRecording(temporaryUri: string): Promise<string> {
  const directory = getRecordingsDirectory();
  const source = new File(temporaryUri);
  const destination = new File(directory, `${createId()}.m4a`);
  await source.move(destination);
  return destination.uri;
}

/**
 * Elimina una grabación guardada. Tolera que el archivo ya no exista
 * (por ejemplo, si se llama dos veces por error): nunca lanza, para que
 * la limpieza de una tarjeta eliminada no pueda romper el resto del
 * flujo de borrado.
 */
export async function deleteRecording(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Falla en silencio: el archivo puede no existir o ya no ser accesible.
  }
}

/** `true` si el archivo de la grabación todavía existe en el dispositivo. */
export function recordingExists(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}
