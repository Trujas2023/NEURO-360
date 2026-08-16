import * as Speech from 'expo-speech';

import { DEFAULT_SPEECH_LANGUAGE } from '@shared/constants/app';

export interface SpeakOptions {
  /** Código de idioma BCP-47 (p. ej. "es-ES"). Por defecto, español. */
  language?: string;
}

/**
 * Cola de un solo elemento: cada llamada a `speak` se encadena después de
 * que la anterior terminó de detener el motor nativo, así toques rápidos
 * y sucesivos nunca disparan dos reproducciones superpuestas (la más
 * reciente siempre gana, sin solaparse con la anterior).
 */
let pending: Promise<void> = Promise.resolve();

/**
 * Texto a voz local del dispositivo (sin servicios externos de pago).
 * Español por defecto; `language` queda abierto para agregar otros
 * idiomas más adelante sin cambiar esta API.
 */
export function speak(text: string, options: SpeakOptions = {}): void {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  const language = options.language ?? DEFAULT_SPEECH_LANGUAGE;
  pending = pending
    .catch(() => {})
    .then(async () => {
      await Speech.stop();
      // R3: antes, un fallo del motor de TTS del dispositivo (p. ej. sin
      // voces instaladas) quedaba completamente silencioso — ni siquiera
      // un log. `onError` no evita el fallo (no hay nada que la app pueda
      // hacer sin un TTS nativo), pero deja evidencia diagnosticable en
      // vez de que el comunicador "no pase nada" sin ninguna pista.
      Speech.speak(trimmed, {
        language,
        onError: (error) => {
          console.warn('[speech] expo-speech falló al reproducir', error);
        },
      });
    });
}

export function stopSpeaking(): void {
  pending = pending.catch(() => {}).then(() => Speech.stop());
}
