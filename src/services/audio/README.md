# audio

Reproducción de voz.

- **Fase 3-4 (implementado)**: `speech.ts` envuelve `expo-speech` (texto a
  voz local del dispositivo, sin servicios externos de pago) usado por el
  comunicador AAC. Español (`es-ES`) por defecto vía
  `DEFAULT_SPEECH_LANGUAGE`; la API acepta `language` para preparar otros
  idiomas más adelante. `speak()` encadena las llamadas en una cola de un
  solo elemento (detiene la reproducción anterior antes de iniciar la
  siguiente), así toques rápidos y sucesivos nunca superponen audio.
  Errores del motor de voz se atrapan y se ignoran: la app sigue
  funcionando en silencio en vez de romper la pantalla.
- **v0.2 (implementado)**: `playback.ts` reproduce grabaciones de voz
  personalizadas (`expo-audio`) guardadas localmente por un adulto. El
  comunicador prioriza esta grabación sobre el texto a voz cuando existe
  (ver `features/aac-communicator/context/PhraseContext.tsx`). La
  grabación en sí (permiso de micrófono, UI de grabar/reproducir/
  regrabar/eliminar) vive en
  `features/aac-communicator/components/AudioRecorderField.tsx`.
