# audio

Reproducción de voz.

- **Fase 3-4 (implementado)**: `speech.ts` envuelve `expo-speech` (texto a
  voz local del dispositivo, sin servicios externos de pago) usado por el
  comunicador AAC. Español (`es-ES`) por defecto vía
  `DEFAULT_SPEECH_LANGUAGE`; la API acepta `language` para preparar otros
  idiomas más adelante. `speak()` encadena las llamadas en una cola de un
  solo elemento (detiene la reproducción anterior antes de iniciar la
  siguiente), así toques rápidos y sucesivos nunca superponen audio.
- **Fase 5 (pendiente)**: grabaciones de voz personalizadas de los padres.
  Candidato técnico: `expo-av`/`expo-audio`.
