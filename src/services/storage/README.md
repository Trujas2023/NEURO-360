# storage

Capa de persistencia offline-first, sin dependencias de red.

- **Fase 2 (implementado)**: `profilesRepository.ts` y `pinRepository.ts`
  persisten los perfiles infantiles, el perfil activo y el PIN de Modo
  Adulto usando `@react-native-async-storage/async-storage`, a través del
  wrapper JSON genérico `asyncStorage.ts`.
- **`profileDataRegistry.ts`**: registro de limpieza al eliminar un perfil.
  Cada feature con datos propios por perfil (tarjetas AAC hoy) se
  registra una vez con `registerProfileDataCleanup`; `ProfilesContext`
  llama a `cleanupProfileData(id)` al borrar un perfil, sin importar a
  esos features directamente y sin dejar datos huérfanos en AsyncStorage.
- **Fase 9 (pendiente)**: ampliar esta capa para vocabulario personalizado,
  fotos y audios del comunicador. Candidatos técnicos a evaluar en su
  momento: `expo-sqlite` para datos estructurados y `expo-file-system` para
  medios, manteniendo siempre todo en el dispositivo.
