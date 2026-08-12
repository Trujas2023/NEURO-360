# daily-routine

Módulo "Mi Día": agenda visual de rutinas con pasos (Levantarme, Ir al
baño, Vestirme, …), indicador Primero/Después y botón Hecho por paso.
Agregado en "Mi Voz AAC Pro" (Fase 2 de la rama
`claude/mi-voz-aac-pro-fase-2`).

Mismo patrón que `aac-communicator`: persistencia por perfil en
AsyncStorage (`storage/routinesRepository.ts`, registrada en
`profileDataRegistry` para limpiarse si se borra el perfil), siembra de
rutinas por defecto la primera vez (`data/defaultRoutines.ts`) y un hook
de CRUD (`hooks/useRoutines.ts`).

- `screens/MyDayScreen.tsx`: Modo Niño, ve y completa pasos.
- `screens/RoutineManagerScreen.tsx` / `RoutineFormScreen.tsx`: Modo
  Adulto, alta/edición/eliminación de rutinas y pasos (solo texto + emoji
  por ahora; foto/audio por paso quedan pendientes, ver
  `docs/AAC_PRO_FASE2_PLAN.md`).
