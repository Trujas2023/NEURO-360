import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { speak } from '@services/audio/speech';

export interface SensoryFeedback {
  /** Reproduce un sonido corto (texto a voz local) solo si `enabled` es `true`. */
  playCue: (text: string, enabled: boolean, volume?: number) => void;
  /** Vibración corta solo si `enabled` es `true`. Nunca lanza si el dispositivo no vibra. */
  vibrate: (enabled: boolean) => void;
}

/**
 * Sonido y vibración de los juegos sensoriales. Recibe el estado
 * ON/OFF explícito en cada llamada (en vez de leerlo de un contexto) para
 * que cada juego pueda ofrecer un ajuste en el momento (ver "Configurable"
 * de cada juego) sin persistirlo — los valores iniciales de esos
 * controles salen de `useSensoryRuntime`.
 */
export function useSensoryFeedback(): SensoryFeedback {
  const playCue = useCallback((text: string, enabled: boolean, volume = 0.8) => {
    if (enabled) {
      speak(text, { volume });
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

  return { playCue, vibrate };
}
