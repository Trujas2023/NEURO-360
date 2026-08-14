import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';

/**
 * Reproducción de grabaciones de voz personalizadas (tarjetas AAC).
 * Mismo criterio que `speech.ts`: reemplaza cualquier reproducción
 * anterior en vez de superponerla, así toques rápidos y sucesivos nunca
 * solapan audio, y nunca suena una grabación al mismo tiempo que el TTS.
 */
let activePlayer: AudioPlayer | null = null;

export function playRecording(uri: string): void {
  try {
    activePlayer?.remove();
  } catch {
    // El reproductor anterior puede ya estar liberado; no es un error real.
  }
  activePlayer = null;

  try {
    const player = createAudioPlayer({ uri });
    activePlayer = player;
    player.play();
  } catch {
    // Archivo inexistente, formato inválido, etc.: falla en silencio. Quien
    // llama (`speakCard`) ya comprobó que el archivo existe antes de
    // llegar acá; esto es una red de seguridad adicional.
  }
}

export function stopRecordingPlayback(): void {
  try {
    activePlayer?.pause();
  } catch {
    // no-op: no había nada reproduciéndose.
  }
}
