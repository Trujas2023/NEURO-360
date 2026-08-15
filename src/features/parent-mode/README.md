# parent-mode

Área de adulto protegida por PIN.

- `components/PinPad.tsx`: teclado numérico grande para crear/ingresar el PIN.
- `screens/PinGateScreen.tsx`: crea el PIN la primera vez y lo valida las
  siguientes; el PIN es una barrera parental (fricción), no un mecanismo de
  seguridad criptográfica (`services/storage/pinRepository.ts`).
- `screens/AdultCenterScreen.tsx` (Fase 7D, reemplaza a la antigua
  `AdultHomeScreen`): landing de Centro Adulto — selector del perfil a
  administrar + grilla de secciones (Mi Voz, Mundo Sensorial, Juega &
  Regula, Mi Día, Estadísticas) sobre ese perfil, más una sección
  "General" transversal (Accesibilidad, Respaldo). Las pantallas de
  administración de cada sistema (`AacManager`, `AacSettings`,
  `SensorySettings`, `GamesSettings`, `RoutineManager`) viven en sus
  propios features; acá solo se navega a ellas.
- `screens/AccessibilityScreen.tsx` (Fase 7H): sonido/movimiento del
  perfil en un solo lugar (mismos campos de `ChildProfilePreferences` que
  ya existían en `ProfileFormScreen`, no duplicados); enlaza a
  `AacSettings` para tamaño de texto y qué mostrar en tarjeta en vez de
  repetir esos controles. Alto contraste queda pendiente: no hay ninguna
  paleta alternativa definida en el Design System todavía.
- `screens/StatisticsScreen.tsx` (Fase 7H): más usados/recientes de Mi Voz
  por perfil, con los datos que las tarjetas AAC ya venían acumulando
  (`usageCount`/`lastUsedAt`). Rutinas completadas y partidas jugadas
  quedan pendientes: `DailyRoutine`/`GameSettings` no guardan ningún
  historial hoy, solo estado actual.
- `screens/BackupScreen.tsx` (Fase 7H) + `services/backup/backupService.ts`:
  exporta perfiles/tarjetas/frases guardadas/rutinas/ajustes de Mundo
  Sensorial y Juegos de todos los perfiles a un único JSON (selector
  nativo de compartir/guardar de Android, nunca sube nada a un servidor
  propio), y restaura desde ese mismo archivo. No incluye grabaciones de
  voz (`audioUri` se conserva en el JSON, así que si el archivo ya no
  existe la tarjeta cae a TTS sola) ni el PIN de adulto.
