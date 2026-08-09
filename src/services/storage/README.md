# storage

Capa de persistencia offline-first, sin dependencias de red.

- **Fase 2 (implementado)**: `profilesRepository.ts` y `pinRepository.ts`
  persisten los perfiles infantiles, el perfil activo y el PIN de Modo
  Adulto usando `@react-native-async-storage/async-storage`, a través del
  wrapper JSON genérico `asyncStorage.ts`.
- **Fase 9 (pendiente)**: ampliar esta capa para vocabulario personalizado,
  fotos y audios del comunicador. Candidatos técnicos a evaluar en su
  momento: `expo-sqlite` para datos estructurados y `expo-file-system` para
  medios, manteniendo siempre todo en el dispositivo.
