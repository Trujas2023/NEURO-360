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
      Speech.speak(trimmed, { language });
    });
}

export function stopSpeaking(): void {
  pending = pending.catch(() => {}).then(() => Speech.stop());
}
