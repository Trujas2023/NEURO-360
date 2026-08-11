import { Directory, File, Paths } from 'expo-file-system';

import { createId } from '@shared/utils/id';

/**
 * DATOS LOCALES ÚNICAMENTE: este módulo copia fotos y audios elegidos por
 * un adulto a `Paths.document` (almacenamiento privado de la app, "a
 * salvo de que el sistema los borre"), en vez de depender de la URI de
 * caché temporal que entregan `expo-image-picker`/grabación de audio (esa
 * caché sí puede ser liberada por el sistema operativo en cualquier
 * momento). Nada de lo que pasa por acá se sube a un servidor: todo
 * queda en el dispositivo del usuario.
 */

const ROOT_FOLDER = 'sense-play-media';

export type MediaKind = 'profile-avatars' | 'card-images' | 'card-audio';

function getSubdirectory(subfolder: MediaKind): Directory {
  const dir = new Directory(Paths.document, ROOT_FOLDER, subfolder);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

function extensionFromUri(uri: string, fallback: string): string {
  const withoutQuery = uri.split('?')[0];
  const match = /\.([a-zA-Z0-9]+)$/.exec(withoutQuery);
  return match ? match[1] : fallback;
}

/**
 * Copia un archivo (foto o audio) elegido por un adulto a un directorio
 * persistente propio de la app y devuelve la nueva URI local estable.
 */
export async function persistLocalFile(
  sourceUri: string,
  subfolder: MediaKind,
  fallbackExtension: string,
): Promise<string> {
  const directory = getSubdirectory(subfolder);
  const extension = extensionFromUri(sourceUri, fallbackExtension);
  const destination = new File(directory, `${createId()}.${extension}`);
  const source = new File(sourceUri);
  await source.copy(destination);
  return destination.uri;
}

/** Borra un archivo persistido con `persistLocalFile`, si existe. Nunca lanza: un archivo faltante no debe romper la app. */
export function deleteLocalFile(uri?: string): void {
  if (!uri) {
    return;
  }
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Archivo ya eliminado, permiso revocado, etc.: se ignora a propósito.
  }
}
