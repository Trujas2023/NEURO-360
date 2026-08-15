import { createAudioPlayer } from 'expo-audio';
import type { AudioSource } from 'expo-audio';

/**
 * Reproduce un tono corto (Mundo Sensorial → "Sonidos y ritmo"). A
 * diferencia de `recordingPlayback.ts`, acá varios tonos SÍ pueden sonar
 * superpuestos a propósito: tocar varias notas seguidas debe sonar como un
 * instrumento, no cortarse entre sí como una grabación de voz.
 *
 * Cada tono crea su propio reproductor efímero y se libera solo pasado su
 * tiempo de sonido — no hay lista ni cola que gestionar.
 */
const CLIP_DURATION_MS = 1600;

export function playTone(source: AudioSource): void {
  try {
    const player = createAudioPlayer(source);
    player.play();
    setTimeout(() => {
      try {
        player.remove();
      } catch {
        // Puede ya estar liberado; no es un error real.
      }
    }, CLIP_DURATION_MS);
  } catch {
    // Asset bundleado ausente o formato no soportado en el dispositivo:
    // falla en silencio, coherente con el resto de la capa de audio.
  }
}
