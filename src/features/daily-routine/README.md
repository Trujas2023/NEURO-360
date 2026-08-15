# daily-routine

Módulo "Mi Día": agenda visual de rutinas con pasos, indicadores de
posición, temporizador visual y refuerzo al terminar. Es uno de los
cuatro tabs principales de `MainTabs`.

Mismo patrón que `aac-communicator`: persistencia por perfil en
AsyncStorage (`storage/routinesRepository.ts`, registrada en
`profileDataRegistry` para limpiarse si se borra el perfil), siembra de
rutinas por defecto la primera vez (`data/defaultRoutines.ts`, 10 rutinas)
y un hook de CRUD (`hooks/useRoutines.ts`).

## Modos de presentación

Cada rutina guarda un `displayMode` que elige un adulto, porque el apoyo
visual que funciona depende de la persona y no de la actividad:

- `list`: todos los pasos a la vez (comportamiento histórico).
- `firstThen`: tablero PRIMERO / DESPUÉS, solo dos pasos a la vez.
- `nowNextDone`: AHORA / DESPUÉS / TERMINADO.

## Temporizador y refuerzo

- `components/VisualTimer.tsx`: barra que se vacía, **nunca números**, para
  que sirva a quien todavía no lee la hora. Con `reduceMotion` se dibuja
  en bloques que se apagan de a uno en vez de vaciarse de forma continua.
  Solo aparece en pasos con `durationSeconds`, y **no marca el paso solo
  al llegar a cero**: quién decide que algo terminó es la persona, no el
  reloj.
- `components/RoutineComplete.tsx`: refuerzo al completar la rutina —
  mensaje positivo y aparición suave, sin confeti ni rebotes. El sonido
  lo dispara `MyDayScreen` en la transición exacta al último paso, así
  suena una sola vez y respeta `soundEnabled` del perfil.

## Pantallas

- `screens/MyDayScreen.tsx`: Modo Niño, ve y completa pasos.
- `screens/RoutineManagerScreen.tsx`: Modo Adulto, lista con duplicar,
  reordenar, editar y eliminar.
- `screens/RoutineFormScreen.tsx`: Modo Adulto, alta/edición de rutina
  (nombre, emoji, color, modo de presentación) y de sus pasos (texto,
  emoji, foto y duración).

Pendiente: grabación de audio por paso (`RoutineStep.audioUri` está
reservado); hoy los pasos se leen con texto a voz.

## Historial de completadas (Fase 7I)

`DailyRoutine.completedCount` / `lastCompletedAt` se actualizan en
`useRoutines.ts` → `toggleStepDone`, y solo en la transición de
incompleta a completa: tocar el último paso pendiente suma uno; seguir
tocando pasos de una rutina que ya estaba completa, reordenar o editar
pasos no suma nada, y `resetRoutine` tampoco resta. El Centro Adulto lo
muestra en `parent-mode/screens/StatisticsScreen.tsx`.
