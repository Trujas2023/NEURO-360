import { playRecording, recordingExists, speak, stopRecordingPlayback, stopSpeaking } from '@services/audio';
import type { SpeakOptions } from '@services/audio';

import type { AacCard } from '../types';

export function spokenTextOf(card: AacCard): string {
  return card.spokenText ?? card.label;
}

/**
 * Habla una tarjeta con la regla del comunicador: primero la grabación
 * de voz personalizada si existe **y el archivo sigue en el
 * dispositivo**; si no, texto a voz. Nunca las dos a la vez.
 *
 * Comprobar que el archivo existe (no solo que `audioUri` esté seteado)
 * es lo que hace que una tarjeta con una grabación borrada por error, o
 * de un respaldo restaurado sin sus archivos de audio, siga funcionando:
 * cae a TTS en vez de quedarse muda.
 *
 * También corta explícitamente la otra vía antes de empezar: la grabación
 * y el TTS son colas independientes, así que un toque rápido en una
 * tarjeta con grabación justo después de una sin grabación (o viceversa)
 * podría solaparlas si no se detiene la otra primero.
 */
export function speakCard(card: AacCard, ttsOptions: SpeakOptions): void {
  if (card.audioUri && recordingExists(card.audioUri)) {
    stopSpeaking();
    playRecording(card.audioUri);
    return;
  }
  stopRecordingPlayback();
  speak(spokenTextOf(card), ttsOptions);
}
