import { createAudioPlayer } from 'expo-audio';

/**
 * Reproduce un archivo de audio local (grabación personalizada guardada en
 * el dispositivo). Nunca lanza: si el archivo falta o está dañado, el
 * llamador debe seguir funcionando (por ejemplo, recurriendo a texto a
 * voz) en vez de romper la pantalla.
 */
export function playSound(uri: string): void {
  try {
    const player = createAudioPlayer({ uri });
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        subscription.remove();
        player.remove();
      }
    });
    player.play();
  } catch {
    // Se ignora a propósito: el llamador decide el respaldo (texto a voz).
  }
}
