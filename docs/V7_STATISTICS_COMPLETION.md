# Historial de Mi Día y Juegos en Estadísticas (Fase 7I)

**Estado:** séptima fase de V7 con código real. Cierra el pendiente que
7H (`docs/V7_ADULT_CENTER_COMPLETION.md`, §7) dejó explícito: Estadísticas
solo mostraba Mi Voz porque `DailyRoutine`/`GameSettings` no guardaban
ningún historial, solo estado actual. No toca `android.package`,
`ios.bundleIdentifier`, `versionCode` ni configuración EAS — verificado,
`git diff app.json` sin cambios, sin dependencias nuevas en `package.json`.

---

## 1. Mi Día — rutinas completadas

`DailyRoutine` gana dos campos opcionales: `completedCount` y
`lastCompletedAt`. Se actualizan en un único lugar,
`useRoutines.ts` → `toggleStepDone`, comparando si **todos** los pasos
estaban hechos antes del toque (`wasComplete`) contra si lo están después
(`isComplete`):

- `isComplete && !wasComplete` → transición real de incompleta a
  completa → suma 1 a `completedCount` y actualiza `lastCompletedAt`.
- Seguir tocando pasos de una rutina que ya estaba completa (destocar y
  volver a tocar, por ejemplo) → no suma, porque `wasComplete` ya era
  `true`.
- Reordenar (`moveStep`) o editar (`updateStep`) pasos → no pasa por
  `toggleStepDone`, no toca el conteo.
- `resetRoutine` → no resta ni toca `completedCount`: es historial, no
  estado actual: una rutina reiniciada sigue habiendo sido completada las
  veces que lo fue.

Opcionales por compatibilidad: una rutina guardada antes de esta fase no
tiene estos campos; se lee como `?? 0` donde hace falta.

---

## 2. Juegos — partidas jugadas

`features/games/storage/gameStatsRepository.ts` (nuevo), mismo patrón que
el resto de los repositorios del proyecto (`getX`/`saveX`/`removeX` por
perfil, registrado en `profileDataRegistry` para limpiarse si se borra el
perfil). Guarda, por juego, `sessionsCompleted` y `lastPlayedAt`.

`recordGameSession(profileId, gameId)` se llama una sola vez por partida,
en el mismo efecto que detecta `finished`:

- Los 4 juegos de emparejar (Colores, Formas, Emociones, Clasificar)
  comparten motor (`ChoiceGame.tsx`) — un solo efecto ahí cubre los 4, con
  `gameId` como prop nueva de cada pantalla.
- Memoria y Secuencias tienen motor propio — mismo efecto agregado en cada
  una (`MemoryScreen.tsx`, `SequenceScreen.tsx`).

Salir con "Terminar" a mitad de partida no dispara el efecto: `finished`
nunca pasa a `true` en ese camino, así que no cuenta como partida jugada
— es coherente con "más usados" de Mi Voz, que tampoco cuenta toques que
no llegaron a pasar nada.

---

## 3. Estadísticas — tres secciones independientes

`StatisticsScreen.tsx` ahora arma tres secciones por perfil (Mi Voz, Mi
Día, Juegos), cada una visible **solo si tiene datos** — no se muestran
las tres siempre con la de al lado vacía. El mensaje de "sin actividad
todavía" cubre el caso de ninguna de las tres. Fuentes:

- Mi Voz: sin cambios, `usageCount`/`lastUsedAt` de `useAacCards`.
- Mi Día: `useRoutines(profileId)`, filtra rutinas con
  `completedCount > 0`, ordena de más a menos veces completada.
- Juegos: `getGameStats(profileId)` (efecto propio con su propio
  `loading`, mismo patrón `run()` async-dentro-de-efecto que ya usan
  `useAacCards`/`useRoutines` para no disparar `setState` de forma
  síncrona en el cuerpo del efecto — regla `react-hooks/set-state-in-effect`).
  Nombre y emoji de cada juego salen de `GAME_LABELS` (nuevo, en
  `games/types.ts`), para no repetir los títulos que ya vivían sueltos en
  cada pantalla de juego.

---

## 4. Respaldo — se extiende, no se rompe

`services/backup/backupService.ts` ahora exporta e importa también
`gameStats` por perfil (`getGameStats`/`saveGameStats`, esta última nueva
en el repositorio). Las rutinas ya viajaban completas como JSON — sus
campos nuevos (`completedCount`/`lastCompletedAt`) quedan incluidos sin
tocar `backupService.ts`, porque `routines` siempre se serializó como el
objeto `DailyRoutine` entero, no campo por campo.

**`SCHEMA_VERSION` se mantiene en 1**, a propósito: es un cambio aditivo
puro. Un respaldo viejo (sin `gameStats`) sigue restaurando bien —
`restoreBackup` ya comprobaba `if (data.gameStats)` antes de escribir,
mismo patrón que el resto de los campos opcionales — y un respaldo nuevo
sigue siendo válido para el código de 7H, que simplemente ignora el campo
que no conoce.

---

## 5. Decidido explícitamente NO construir en esta fase

- **`storageVersion`/migraciones formales del respaldo:** no hay ningún
  cambio de formato que rompa compatibilidad todavía — el de esta fase es
  aditivo, como cualquier otro hasta ahora. Construir un sistema de
  migraciones sin una migración real que lo necesite sería la abstracción
  prematura que el proyecto evita a propósito. Se retoma el día que un
  cambio de verdad requiera transformar datos viejos.
- **Interfaces formales de repositorio** (un `Repository<T>` genérico
  sobre `getX`/`saveX`/`removeX`): el patrón ya es consistente en los
  ~8 repositorios del proyecto por convención, copiado a mano cada vez.
  No apareció ningún consumidor real que necesite tratarlos de forma
  polimórfica (iterar todos los repositorios, inyectar uno distinto en
  tests, etc.) — sin ese consumidor, formalizar la interfaz es
  ceremonia sin beneficio medible.
- **Grabaciones de voz en el respaldo:** sigue fuera, misma razón que en
  7H — son binarios pesados y el tamaño de un respaldo con audio incluido
  necesita su propio análisis (¿un archivo por grabación, base64 embebido,
  límite de tamaño?) que no se puede resolver de paso en esta fase.

---

## 6. Archivos modificados/creados

**Nuevos:** `src/features/games/storage/gameStatsRepository.ts`.

**Modificados:**
- `src/features/daily-routine/types.ts` (`completedCount`/`lastCompletedAt`)
- `src/features/daily-routine/hooks/useRoutines.ts` (`toggleStepDone`)
- `src/features/daily-routine/README.md`
- `src/features/games/types.ts` (`GAME_LABELS`)
- `src/features/games/components/ChoiceGame.tsx`
- `src/features/games/screens/CategorySortScreen.tsx`,
  `ColorMatchScreen.tsx`, `EmotionsScreen.tsx`, `ShapeMatchScreen.tsx`
  (prop `gameId`)
- `src/features/games/screens/MemoryScreen.tsx`, `SequenceScreen.tsx`
  (efecto propio de registro)
- `src/features/games/README.md`
- `src/features/parent-mode/screens/StatisticsScreen.tsx`
- `src/features/parent-mode/README.md`
- `src/services/backup/backupService.ts`
- `docs/QA_ANDROID_INTERNAL_TESTING.md` (sección 21 actualizada, sección
  22 nueva)

---

## 7. Qué funciona

- Completar una rutina en Modo Niño se refleja en Estadísticas del mismo
  perfil, con el conteo correcto en repetidas veces.
- Terminar una partida de cualquiera de los 6 juegos se refleja igual;
  abandonar a mitad de camino no cuenta.
- Las tres secciones de Estadísticas aparecen y desaparecen de forma
  independiente según haya datos.
- El respaldo exporta y restaura el historial nuevo sin romper
  compatibilidad con respaldos de la fase anterior.
- `npx tsc --noEmit` y `npx eslint .`: sin errores ni warnings.
- Sin dependencias nuevas — no aplica verificación de `expo prebuild`
  para permisos de Android.

## 8. Qué queda pendiente

- Alto contraste (Accesibilidad) — sigue igual que en 7H, necesita
  paleta del Design System.
- Verificación en dispositivo Android real — este entorno no tiene uno.
- `storageVersion`, interfaces de repositorio, audio en el respaldo —
  decisión explícita de no construirlos todavía (§5), se retoman si
  aparece la necesidad real.

---

## Cierre de Fase 7I

`npx tsc --noEmit` y `npx eslint .` sin errores. No se tocó
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS. Detenido aquí, a la espera de autorización para iniciar la Fase 7J.
