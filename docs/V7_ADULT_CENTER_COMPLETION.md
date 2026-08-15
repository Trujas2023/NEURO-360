# Centro Adulto — Accesibilidad, Estadísticas, Respaldo (Fase 7H)

**Estado:** sexta fase de V7 con código real. Cierra las 3 secciones de
Centro Adulto que `docs/V7_UX_ARCHITECTURE.md` (7B) dejó pendientes a
propósito en 7D, para no repetir el problema de `ComingSoonScreen` con
tarjetas sin función real. No toca `android.package`,
`ios.bundleIdentifier`, `versionCode` ni configuración EAS.

---

## 1. Accesibilidad (`AccessibilityScreen`)

**No se inventó ninguna preferencia nueva.** "Sonido activado" y "Reducir
movimiento" ya existían como campos de `ChildProfilePreferences`, pero
solo eran editables mezclados con nombre/foto/avatar dentro de
`ProfileFormScreen` — exactamente el problema que `docs/
V7_PRODUCT_AUDIT.md` señaló (§4/§6). Ahora tienen un lugar propio y
persistente-al-toque (mismo patrón instantáneo que `AacSettingsScreen`,
sin botón "Guardar" aparte), sin dejar de funcionar también desde
`ProfileFormScreen` — es el mismo campo en los dos lugares, no una copia.

Tamaño de texto y qué mostrar en tarjeta **no se duplican acá**: la
pantalla enlaza directo a `AacSettings`, tal como decidió 7B, para que no
existan dos lugares que puedan desincronizarse.

**Alto contraste queda fuera, documentado como tal:** el brief menciona
"contraste" junto con tamaño de texto/reducción de movimiento, pero hoy no
existe ninguna paleta alternativa en el Design System (Fase 7C) — agregar
un toggle sin una paleta real detrás sería el mismo defecto que
`ComingSoonScreen`. Necesita una decisión de Design System antes de poder
construirse.

---

## 2. Estadísticas (`StatisticsScreen`)

Por perfil, primera versión **limitada a propósito** a datos que ya se
venían acumulando: `usageCount`/`lastUsedAt` de cada tarjeta AAC (el
campo `createdByUser` de `AacCard` ya traía un comentario desde antes
diciendo "pensado para una futura pantalla de estadísticas" — esta es esa
pantalla). Muestra: total de tarjetas y toques, más usadas y usadas
recientemente.

**Rutinas completadas y partidas jugadas no están** — decisión explícita
de 7B (§9), no un olvido: `DailyRoutine`/`GameSettings` no guardan ningún
historial hoy, solo estado actual (`RoutineStep.done`, que además se
resetea al reiniciar una rutina). Inventarlos habría requerido un campo
nuevo en el modelo de datos sin la decisión de diseño correspondiente —
mejor una sección más chica que funciona de verdad que una completa con
números falsos. La pantalla lo dice explícitamente en vez de omitirlo en
silencio.

---

## 3. Respaldo (`BackupScreen` + `services/backup/backupService.ts`)

Exporta perfiles, tarjetas AAC, frases guardadas, rutinas y ajustes de
Mundo Sensorial/Juegos de **todos los perfiles a la vez** a un único
archivo JSON, usando el selector nativo de compartir/guardar de Android
(`expo-sharing`) — nunca sube nada a un servidor propio de la app.
Restaurar usa el selector nativo de archivos que ya trae
`expo-file-system` (`File.pickFileAsync`, sin dependencia nueva de
terceros para eso), valida que el archivo elegido sea un respaldo real de
esta app antes de tocar nada, y pide confirmación explícita antes de
sobrescribir ("no se puede deshacer, salvo que tengas otro respaldo").

**Deliberadamente NO incluye** (documentado en el propio código):
- **El PIN de adulto**: es texto plano por diseño (barrera parental, no
  criptográfica); exportarlo en un archivo que se puede compartir por
  error es un riesgo que no vale la pena — si falta al restaurar,
  `PinGateScreen` simplemente pide crear uno nuevo, sin romper nada.
- **Los archivos de audio de las grabaciones de voz**: son binarios
  pesados; incluirlos es una decisión de una fase futura con su propio
  análisis de tamaño (7B ya lo marcaba así en §10). El campo `audioUri`
  sí se conserva en el JSON — si el archivo ya no está en el dispositivo
  al restaurar, la tarjeta cae a TTS sola, mismo comportamiento que
  cualquier grabación perdida por otro motivo.

**Dependencia nueva:** `expo-sharing` (`~57.0.9`, versión que el propio
SDK 57 de Expo declara compatible). Se evaluó también `expo-document-picker`
para la importación, pero `expo-file-system` (ya instalado desde la fase
de voz) ya trae su propio selector de archivos nativo
(`File.pickFileAsync`) — se usó ese en vez de sumar una dependencia
redundante. Verificado con `expo prebuild` local que ninguna de las dos
agrega permisos nuevos de Android más allá de los que ya existían.

---

## 4. Centro Adulto — integración de las 3 secciones

`AdultCenterScreen` (de 7D) gana:
- **Estadísticas** como quinta tarjeta de la grilla "Ajustes de
  {perfil}", junto a Mi Voz/Sensorial/Juegos/Mi Día — es por perfil, tal
  como especificó 7B.
- Una sección nueva **"General"**, siempre visible sin importar qué
  perfil esté elegido arriba, con **Accesibilidad** y **Respaldo**.
  Respaldo no necesita ningún perfil (respalda todos a la vez);
  Accesibilidad sí necesita uno para saber qué editar — si todavía no hay
  ningún perfil creado, avisa con un mensaje claro en vez de navegar a
  una pantalla rota.

---

## 5. Archivos modificados/creados

**Nuevos:** `src/features/parent-mode/screens/AccessibilityScreen.tsx`,
`StatisticsScreen.tsx`, `BackupScreen.tsx`,
`src/services/backup/backupService.ts`.

**Modificados:** `src/features/parent-mode/screens/AdultCenterScreen.tsx`,
`src/features/aac-communicator/storage/savedPhrasesRepository.ts` (se
exportó `saveSavedPhrases`, ya existía sin exportar — necesario para
restaurar un respaldo), `src/app/navigation/types.ts`,
`src/app/navigation/RootNavigator.tsx`,
`src/features/parent-mode/README.md`,
`docs/QA_ANDROID_INTERNAL_TESTING.md` (sección 21, nueva).

`package.json`/`package-lock.json`: `expo-sharing` agregado.

---

## 6. Qué funciona

- Las 3 secciones nuevas de Centro Adulto tienen función real, ninguna es
  una tarjeta "próximamente".
- Accesibilidad: cambios instantáneos, mismo dato en dos pantallas sin
  desincronizarse.
- Estadísticas: datos reales derivados del uso, con vacío honesto cuando
  no hay actividad.
- Respaldo: exporta e importa de verdad, con validación y confirmación
  antes de sobrescribir; funciona sin conexión.
- `npx tsc --noEmit` y `npx eslint .`: sin errores ni warnings.
- Verificado con `expo prebuild` local: sin permisos de Android nuevos,
  `package`/`applicationId`/`versionCode` sin cambios.

## 7. Qué queda pendiente

- Alto contraste (Accesibilidad) — necesita una paleta alternativa del
  Design System primero.
- Estadísticas de Mi Día y Juegos — necesita un campo de historial nuevo
  en el modelo de datos, decisión de la Fase 7I.
- Si el respaldo debería incluir las grabaciones de voz — decisión de la
  Fase 7I, con su propio análisis de tamaño.
- `storageVersion`/migraciones formales si el formato de respaldo
  necesita evolucionar — Fase 7I.
- Verificación en dispositivo real (compartir/restaurar un archivo real
  en Android) — este entorno no tiene uno — 7J.

---

## Cierre de Fase 7H

`npx tsc --noEmit` y `npx eslint .` sin errores. No se tocó
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS (verificado también con `expo prebuild` local). Detenido aquí, a la
espera de autorización para iniciar la Fase 7I.
