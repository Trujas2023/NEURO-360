import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export interface SensoryFeedback {
  /** Reproduce un efecto de sonido local empaquetado (ver `constants/soundAssets.ts`) solo si `enabled` es `true`. */
  playSound: (asset: number, enabled: boolean, volume?: number) => void;
  /** Vibración corta solo si `enabled` es `true`. Nunca lanza si el dispositivo no vibra. */
  vibrate: (enabled: boolean) => void;
}

/**
 * Sonido y vibración de los juegos sensoriales. Recibe el estado
 * ON/OFF explícito en cada llamada (en vez de leerlo de un contexto) para
 * que cada juego pueda ofrecer un ajuste en el momento (ver "Configurable"
 * de cada juego) sin persistirlo — los valores iniciales de esos
 * controles salen de `useSensoryRuntime`.
 *
 * Los efectos de sonido son archivos de audio reales empaquetados
 * localmente (sin texto a voz, sin servicios externos): cada llamada crea
 * un reproductor de corta vida con `expo-audio` (la misma librería que ya
 * usa el comunicador AAC para reproducir voces grabadas) y lo libera solo
 * cuando termina de sonar.
 */
export function useSensoryFeedback(): SensoryFeedback {
  const playSound = useCallback((asset: number, enabled: boolean, volume = 0.8) => {
    if (!enabled) {
      return;
    }
    try {
      const player = createAudioPlayer(asset);
      player.volume = volume;
      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          subscription.remove();
          player.remove();
        }
      });
      player.play();
    } catch {
      // Si el audio falla, el juego sigue funcionando en silencio en vez de romper la pantalla.
    }
  }, []);

  const vibrate = useCallback((enabled: boolean) => {
    if (!enabled) {
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Algunos dispositivos no tienen motor de vibración: se ignora a propósito.
    });
  }, []);

  return { playSound, vibrate };
}
