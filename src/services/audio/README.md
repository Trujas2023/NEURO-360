# audio

Reproducción de voz.

- **Fase 3-4 (implementado)**: `speech.ts` envuelve `expo-speech` (texto a
  voz local del dispositivo, sin servicios externos de pago) usado por el
  comunicador AAC. Español (`es-ES`) por defecto vía
  `DEFAULT_SPEECH_LANGUAGE`; la API acepta `language` para preparar otros
  idiomas más adelante.
- **Fase 5 (pendiente)**: grabaciones de voz personalizadas de los padres.
  Candidato técnico: `expo-av`/`expo-audio`.
