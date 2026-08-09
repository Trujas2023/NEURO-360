import * as Speech from 'expo-speech';

import { DEFAULT_SPEECH_LANGUAGE } from '@shared/constants/app';

export interface SpeakOptions {
  /** Código de idioma BCP-47 (p. ej. "es-ES"). Por defecto, español. */
  language?: string;
}

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
  Speech.stop();
  Speech.speak(trimmed, { language: options.language ?? DEFAULT_SPEECH_LANGUAGE });
}

export function stopSpeaking(): void {
  Speech.stop();
}
