# profiles

Gestión de perfiles infantiles y cambio Modo Niño / Modo Adulto.

Implementado en la Fase 2:

- `context/ProfilesContext.tsx`: estado de perfiles + perfil activo,
  persistido vía `@services/storage`.
- `screens/ProfileSelectorScreen.tsx`: selector de perfil (Modo Niño).
- `screens/ProfileFormScreen.tsx`: alta/edición de perfil (nombre, foto o
  color de avatar, preferencias básicas). Solo se navega a esta pantalla
  desde Modo Adulto (`features/parent-mode`).
- `components/ProfileCard.tsx`: tarjeta grande y pulsable para el selector.
