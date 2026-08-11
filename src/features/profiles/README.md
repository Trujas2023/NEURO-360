# profiles

Gestión de perfiles infantiles y cambio Modo Niño / Modo Adulto.

Implementado en la Fase 2:

- `context/ProfilesContext.tsx`: estado de perfiles + perfil activo,
  persistido vía `@services/storage`.
- `screens/ProfileSelectorScreen.tsx`: selector de perfil (Modo Niño).
- `screens/ProfileFormScreen.tsx`: alta/edición de perfil (nombre, foto o
  color de avatar, preferencias básicas). Solo se navega a esta pantalla
  desde Modo Adulto (`features/parent-mode`). La foto se persiste vía
  `@services/media/localFiles` (no depende de la URI temporal del picker).
- `components/ProfileCard.tsx`: tarjeta grande y pulsable para el selector.

**v0.2**: `ChildProfilePreferences` suma ajustes del comunicador AAC —
`speakOnTap` ("Hablar al tocar pictograma") y las preferencias visuales
`cardSize`, `displayMode`, `columns` (Módulo 9), editables en la misma
`ProfileFormScreen`. Al eliminar un perfil también se borra su foto de
avatar del almacenamiento local.
