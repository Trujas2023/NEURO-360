# Roadmap de Reconstrucción — R1 a R10

**Estado:** ESPECIFICACIÓN CERRADA para aprobación. Ninguna fase se ha ejecutado. No se ha tocado código, build, `versionCode` ni configuración EAS.
**Basado en:** `docs/PRODUCT_MASTER_SPEC.md`, `docs/UX_UI_SYSTEM_SPEC.md`, `docs/DEFINITION_OF_DONE.md`.

## Regla de cierre de fase (aplica a las 10 fases sin excepción)

> No se declara una fase terminada si queda algún placeholder, `ComingSoonScreen`, toggle sin efecto real, o funcionalidad de esa fase que no cumpla su entrada correspondiente en `docs/DEFINITION_OF_DONE.md`. El cierre de cada fase requiere verificación contra `docs/FUNCTIONAL_ACCEPTANCE_MATRIX.md` para las filas que le correspondan.

Esta regla es la que la Fase 3 del roadmap original (`docs/ROADMAP.md`) no tuvo, y es la causa raíz de que "técnicamente completo" (TypeScript/ESLint/build en verde) haya sido confundido con "funcionalmente terminado".

---

## R1 — Arquitectura y design system

**Objetivo**: construir la base técnica y visual sobre la que se apoyan las ocho fases siguientes, sin construir todavía funcionalidad de producto nueva visible al usuario final. Es deliberadamente la fase "invisible" — si se hace bien, R2-R6 se sienten más rápidas y más consistentes entre sí.

**Dependencias**: ninguna (fase inicial). Requiere la decisión de nombre de marca del usuario (`PRODUCT_MASTER_SPEC.md` §0.1) antes de tocar `app.json`/textos de marca.

**Archivos/áreas afectadas**:
- `services/storage/*` — reescritura completa sobre `expo-sqlite` (`PRODUCT_MASTER_SPEC.md` §7.3), runner de migraciones, repositorios con la misma interfaz pública que hoy consumen los hooks.
- `services/audio/*` — se deja intacto (`speech.ts` sigue funcionando igual); se prepara el punto de extensión para R2 (grabación).
- `shared/theme/*` — nuevos tokens tipográficos, de color semántico, iconografía (`UX_UI_SYSTEM_SPEC.md` §1).
- `shared/components/*` — `BigButton` extendido, `ScreenContainer` con estados declarativos, nuevos `ConfirmDialog`, `EmptyState`, `Toast`.
- `shared/hooks/*` — nuevos `useResponsiveColumns`, `useReduceMotion`.
- `assets/fonts/` — Atkinson Hyperlegible empaquetada.
- `package.json` — nuevas dependencias: `expo-sqlite`, `@expo/vector-icons` (ya viene con Expo, se formaliza su uso), `expo-haptics`; `expo-audio` se agrega aquí o al inicio de R2 (decisión de implementación, no de producto).

**Funcionalidades**: ninguna funcionalidad de usuario final nueva. Es infraestructura + design system.

**Pruebas**:
- Suite de regresión: toda pantalla existente (Mi Voz, Mi Día, Perfiles, Modo Adulto) sigue funcionando idéntico tras migrar la capa de datos — mismo comportamiento observable, motor distinto por debajo.
- Prueba de migración: datos existentes en AsyncStorage (de una instalación previa) se migran correctamente a SQLite en el primer arranque tras la actualización, sin pérdida.
- Verificación visual: catálogo de componentes base (`BigButton` en sus variantes, `EmptyState`, `ConfirmDialog`) revisado contra `UX_UI_SYSTEM_SPEC.md` §1.

**Criterios de aceptación**:
- Cero regresión funcional en las pantallas existentes (verificado contra `FUNCTIONAL_ACCEPTANCE_MATRIX.md`, filas ya "REALMENTE FUNCIONAL").
- Los hooks públicos (`useAacCards`, `useRoutines`, `ProfilesContext`) no cambian su firma.
- Migración de datos de una instalación AsyncStorage previa verificada con datos de prueba reales, no solo con una base vacía.

**Riesgos**:
- Es la fase de mayor riesgo técnico (cambio de motor de persistencia) concentrado en el punto donde menos hay que mostrar al usuario — riesgo de subestimar el tiempo necesario porque "no se ve nada nuevo".
- Si la migración de datos falla silenciosamente, el daño se manifiesta recién en R2-R6 al construir sobre una base rota — mitigación: la prueba de migración con datos reales es no negociable antes de avanzar.

---

## R2 — Mi Voz AAC

**Objetivo**: llevar el motor de comunicación (~70% según auditoría) a nivel profesional: pictogramas reales, voz familiar, idioma configurable, contextos rápidos.

**Dependencias**: R1 (design system, capa de datos, `expo-audio` si no se agregó en R1).

**Archivos/áreas afectadas**: `features/aac-communicator/*` completo — `components/AacCardVisual.tsx`, `components/PictogramPicker.tsx` (nuevo), `screens/AacCardFormScreen.tsx`, `screens/AacSettingsScreen.tsx`, `screens/AacHomeScreen.tsx` (contextos), `constants/contexts.ts` (nuevo), `data/pictogramIndex.ts` (nuevo), `services/audio/recorder.ts` (nuevo), `assets/images/pictograms/*` (nuevo).

**Funcionalidades** (ver `DEFINITION_OF_DONE.md` §2 para el detalle de cada una): pictogramas profesionales, grabación/reproducción de voz familiar con fallback a TTS, selector de idioma/voz, contextos rápidos, promoción de Sí/No a acceso de un toque, categoría "Sí/No" reforzada.

**Pruebas**: las 4 pruebas manuales descritas en `DEFINITION_OF_DONE.md` §2.1-2.4, más regresión completa del resto del comunicador (búsqueda, favoritos, frase, TTS por defecto) migrado al nuevo design system.

**Criterios de aceptación**: el vocabulario semilla y núcleo usa pictogramas por defecto; al menos una tarjeta con audio grabado sobrevive cierre/reapertura de la app; cambio de idioma verificado auditivamente; contextos no ocultan tarjetas, solo reordenan.

**Riesgos**:
- Licencia del set de pictogramas: si Mulberry Symbols (recomendado en `PRODUCT_MASTER_SPEC.md` §2.3) no se confirma como aceptable, esta fase se bloquea hasta resolver la fuente de pictogramas — es una dependencia externa a la ingeniería.
- Permisos de micrófono nuevos en Android/iOS requieren revisión de que no compliquen la clasificación de contenido infantil de Google Play (`docs/GOOGLE_PLAY_COMPLIANCE.md`) — se referencia, no se resuelve aquí (competencia de R6/publicación).

---

## R3 — Mundo Sensorial

**Objetivo**: pasar del 0% (README únicamente) a seis experiencias reales, jugables, sin condición de derrota.

**Dependencias**: R1 (design system, `useReduceMotion`, capa de datos para configuración por juego).

**Archivos/áreas afectadas**: `features/sensory-games/*` completo (hoy solo tiene `README.md`) — se crean las 6 subcarpetas ya previstas en ese README (`bubble-pop/`, `sensory-paint/` → renombrado conceptualmente a Trazos Calmados, `touch-and-listen/` → Sigue la Luz, `follow-the-color/` → Colores y Formas, más `visual-sorting/` y `soft-rhythm/` nuevas), `features/sensory-games/shared/GameShell.tsx` (nuevo), `features/sensory-games/shared/gameSettingsRepository.ts` (nuevo), `app/navigation/RootNavigator.tsx` (nuevas rutas, reemplaza el destino `ComingSoon` del botón "Mundo Sensorial").

**Funcionalidades**: los 6 juegos especificados en `PRODUCT_MASTER_SPEC.md` §3, cada uno con su DoD en `DEFINITION_OF_DONE.md` §3.

**Pruebas**: las pruebas manuales de cada juego (§3.1-3.6 de `DEFINITION_OF_DONE.md`), más prueba de rendimiento en dispositivo de gama media (framerate estable, sin recalentamiento en sesiones de varios minutos).

**Criterios de aceptación**: los 6 juegos son jugables de extremo a extremo según su DONE objetivo individual; ninguno depende de `ComingSoonScreen`; el botón "Mundo Sensorial"/"Juega & Regula" de Home apunta a contenido real, no a un stub.

**Riesgos**:
- Es la fase de mayor volumen de UI/lógica nueva (6 experiencias interactivas) — riesgo de subestimar el esfuerzo si se trata como "6 pantallas simples" en vez de 6 mecánicas de interacción distintas.
- Rendimiento de animaciones continuas (Sigue la Luz, Trazos Calmados) puede requerir evaluar `react-native-reanimated` (`UX_UI_SYSTEM_SPEC.md` §1.5) si `Animated` no alcanza — decisión a tomar con datos reales de esta fase, no antes.
- Es la fase con más superficie nueva de accesibilidad (motricidad, discriminación visual) — coordinar con R8 para no dejar toda la verificación de accesibilidad de estos juegos acumulada al final.

---

## R4 — Calma 360

**Objetivo**: pasar del ~25% actual (grilla de frases de emergencia únicamente) a un módulo regulatorio real y de acceso universal.

**Dependencias**: R1 (design system, `Animated`/tokens de movimiento, `useReduceMotion`). No depende de R3, aunque comparte principios de diseño de estímulos con Mundo Sensorial.

**Archivos/áreas afectadas**: extracción de `features/aac-communicator/screens/CalmCommunicationScreen.tsx` y `components/QuickCommunication.tsx` hacia un nuevo módulo de primer nivel `features/calm-mode/*` (`screens/CalmHomeScreen.tsx`, `screens/BreathingScreen.tsx`, `screens/LowStimulationScreen.tsx`, `screens/CalmSoundsScreen.tsx`, `components/BreathingBubble.tsx`, `data/breathingPresets.ts`, `services/audio/ambientPlayer.ts`), `app/navigation/RootNavigator.tsx` (Calma como ruta de primer nivel, ya no anidada en `AacNavigator`), `features/aac-communicator/navigation/AacNavigator.tsx` (se retira `AacCalm` de ahí).

**Funcionalidades**: respiración visual guiada, pantalla de baja estimulación, sonidos calmantes, conservación íntegra de las frases rápidas de emergencia (`DEFINITION_OF_DONE.md` §4).

**Pruebas**: las 3 pruebas manuales de `DEFINITION_OF_DONE.md` §4.1-4.3, más verificación de que ningún audio ambiental sigue sonando tras navegar fuera del módulo.

**Criterios de aceptación**: Calma 360 es una ruta de nivel raíz, ya no depende de estar dentro de Mi Voz; los tres módulos nuevos (respiración, baja estimulación, sonidos) son usables de extremo a extremo; las frases de emergencia siguen funcionando exactamente igual que hoy.

**Riesgos**:
- Es un refactor de extracción de código existente (riesgo de regresión en las frases de emergencia si la extracción se hace descuidadamente) combinado con funcionalidad nueva — separar mentalmente ambas partes al implementar y probar cada una por separado.
- El acceso "universal" real (barra fija en toda pantalla de Modo Niño) se completa formalmente en R9 una vez existan todas las pantallas de Modo Niño (Mundo Sensorial de R3 incluido) — en R4 se construye el módulo Calma en sí y su alcanzabilidad desde Home; la integración final en el 100% de las pantallas se verifica en R9, no se da por cerrada aquí.

---

## R5 — Mi Día / Rutinas

**Objetivo**: extender el módulo ya más maduro (~75%) con las piezas que faltan, sin reescribirlo.

**Dependencias**: R1 (capa de datos, pictogramas de R2 si se quiere reutilizar el mismo picker — dependencia blanda, no bloqueante: Mi Día puede usar fotos sin esperar a que R2 tenga pictogramas listos, y sumar pictogramas después).

**Archivos/áreas afectadas**: `features/daily-routine/*` — `hooks/useRoutines.ts` (reinicio automático), `types.ts` (`resetPolicy`, `lastResetAt`, `imageUri`/`pictogramId` en `RoutineStep`), `screens/RoutineFormScreen.tsx` (plantillas, selector de foto/pictograma, temporizador por paso), `screens/MyDayScreen.tsx` (temporizador, recompensa visual), `data/routineTemplates.ts` (nuevo).

**Funcionalidades**: reinicio automático diario, plantillas de franja horaria, fotos/pictogramas por paso, temporizador opcional por paso, recompensa visual opcional al completar (`DEFINITION_OF_DONE.md` §5).

**Pruebas**: las pruebas manuales de §5.1-5.2 de `DEFINITION_OF_DONE.md`, incluida la verificación con cambio real de fecha del dispositivo (no simulación en memoria).

**Criterios de aceptación**: una rutina `daily` se reinicia sola al cambiar de día, verificado con fecha real; pasos con foto persisten correctamente.

**Riesgos**: la lógica de "cambio de día" es engañosamente simple y fácil de hacer mal con zonas horarias/cambios manuales de reloj — cubierto explícitamente como edge case en el DoD, debe probarse con casos adversos, no solo el camino feliz.

---

## R6 — Centro de Adultos

**Objetivo**: expandir Modo Adulto a un panel de administración completo — recuperación de PIN, estadísticas, privacidad, soporte, control parental por módulo.

**Dependencias**: R1 (capa de datos, hash de PIN). Depende parcialmente de R2-R5 para que "Estadísticas de uso" tenga datos reales de todos los módulos que resumir — se especifica y construye la pantalla en R6, pero su cobertura de datos crece a medida que R2-R5 avanzan (no bloqueante: puede lanzarse con lo que exista hasta ese punto e iterar).

**Archivos/áreas afectadas**: `features/parent-mode/*` (renombrado conceptual "Modo Adulto"→"Centro de Adultos" en la UI, no necesariamente en las rutas de código) — `screens/PinGateScreen.tsx`, `screens/PinRecoveryScreen.tsx` (nuevo), `screens/AdultHomeScreen.tsx` (reestructurado según `PRODUCT_MASTER_SPEC.md` §6.2), `screens/StatsScreen.tsx` (nuevo), `screens/PrivacyScreen.tsx` (nuevo), `screens/AboutScreen.tsx` (nuevo), `services/storage/pinRepository.ts` (hash), `services/storage/wipeAllData.ts` (nuevo).

**Funcionalidades**: recuperación de PIN olvidado, cambio voluntario de PIN (adulto ya autenticado), estadísticas de uso, privacidad y eliminación de datos, acerca de/soporte, control parental (habilitar/deshabilitar módulos por perfil) — ver `PRODUCT_MASTER_SPEC.md` §6, `DEFINITION_OF_DONE.md` §6. "Cerrar sesión de adulto" ya es funcional hoy (`AdultHomeScreen.tsx`) y solo se migra al nuevo design system, sin cambio de comportamiento.

**Pruebas**: las pruebas manuales de `DEFINITION_OF_DONE.md` §6.1, §6.3, más verificación de que deshabilitar un módulo para un perfil efectivamente lo oculta/bloquea en Modo Niño para ese perfil únicamente.

**Criterios de aceptación**: recuperar el PIN nunca borra datos; cambiar el PIN voluntariamente reemplaza el anterior de forma inmediata y verificable; eliminación total deja la app en estado de instalación nueva; el panel cubre las 11 secciones especificadas en `PRODUCT_MASTER_SPEC.md` §6.2.

**Riesgos**: el flujo de recuperación de PIN es el único punto de todo el producto donde un diseño descuidado podría crear una puerta trasera de seguridad involuntaria (p. ej. un código de recuperación predecible) — requiere revisión cuidadosa antes de cerrar la fase, no solo prueba funcional.

---

## R7 — Persistencia y respaldo

**Objetivo**: cerrar el hallazgo P0 de la auditoría (riesgo de pérdida total de datos) con exportación/importación/backup real.

**Dependencias**: R1 (capa de datos SQLite ya debe existir). Idealmente posterior a R2-R6 para que el formato de backup cubra el esquema completo (tarjetas con pictogramas/audio, rutinas con fotos, preferencias de todos los módulos) sin tener que revisar el formato de exportación varias veces — se secuencia aquí, después de las fases de producto, mismo criterio usado por el propio roadmap original del proyecto (persistencia después de que existan los datos que persistir).

**Archivos/áreas afectadas**: `features/parent-mode/screens/BackupScreen.tsx` (nuevo), `services/backup/exportBackup.ts`, `services/backup/importBackup.ts` (nuevos), integración con `expo-file-system` + `expo-sharing`.

**Funcionalidades**: exportar todo/por perfil, importar con reemplazar/agregar, manejo de corrupción visible (ya no silencioso) — ver `PRODUCT_MASTER_SPEC.md` §7.4, `DEFINITION_OF_DONE.md` §6.2.

**Pruebas**: ciclo completo exportar→borrar→importar con verificación de integridad de fotos y audios, no solo de datos de texto; prueba de importación de un archivo corrupto (debe fallar limpiamente sin tocar los datos existentes).

**Criterios de aceptación**: recuperación 100% verificada por comparación antes/después (DoD §6.2); una importación fallida nunca deja el dispositivo en peor estado que antes de intentarla.

**Riesgos**: la atomicidad de la importación (todo o nada) es fácil de subestimar — un fallo a mitad de escritura sin transacción podría dejar datos mixtos entre lo viejo y lo nuevo; se recomienda ejecutar la importación completa a una zona temporal y solo reemplazar los datos activos al confirmar éxito total.

---

## R8 — Accesibilidad

**Objetivo**: verificar y cerrar, con evidencia de dispositivo real (no solo lectura de código), todo lo especificado en `UX_UI_SYSTEM_SPEC.md` §5 — incluido el cierre definitivo de `reduceMotion` como ajuste real.

**Dependencias**: R2-R5 (necesita que Mi Voz, Mundo Sensorial, Calma 360 y Mi Día ya existan como pantallas reales para auditarlas) y R1 (`useReduceMotion` debe existir para que R8 verifique que efectivamente se usa en todos los puntos de animación creados en R2-R5).

**Archivos/áreas afectadas**: transversal — no crea features nuevas, sino que audita y corrige `accessibilityLabel`/`accessibilityValue`/orden de foco en todos los componentes construidos hasta este punto, y verifica cada punto de animación contra `useReduceMotion()`.

**Funcionalidades**: ninguna funcionalidad nueva de producto — es verificación y corrección.

**Pruebas**: sesión manual completa con TalkBack activado recorriendo los 5 pilares (Mi Voz, Mundo Sensorial, Calma 360, Mi Día, Centro de Adultos); medición de contraste AA de cada combinación texto/fondo activa; verificación cuantitativa de `reduceMotion` (ninguna animación con duración >0 en modo reducido) en cada uno de los puntos listados en `UX_UI_SYSTEM_SPEC.md` §1.5.

**Criterios de aceptación**: el checklist completo de `UX_UI_SYSTEM_SPEC.md` §6 marcado, con evidencia (no solo declarado).

**Riesgos**: si se deja esta fase completamente al final sin ninguna verificación intermedia durante R2-R5, el volumen de correcciones acumuladas puede ser mayor al esperado — se recomienda una pasada ligera de accesibilidad al cierre de cada una de R2-R5 (no formalmente parte de esa fase, pero como higiene de desarrollo) para que R8 sea principalmente confirmación, no descubrimiento.

---

## R9 — Integración y pulido UX

**Objetivo**: unir los cinco pilares ya terminados individualmente en un producto coherente — el Home rediseñado, la barra universal funcionando en el 100% de las pantallas, tablet/orientación, y la limpieza final de nomenclatura/placeholders.

**Dependencias**: R2-R8 completas (es, por definición, la fase que integra todo lo anterior).

**Archivos/áreas afectadas**: `app/screens/HomeScreen.tsx` (rediseño a grilla de 4 pilares + franja de perfil, `PRODUCT_MASTER_SPEC.md` §1.2), `shared/components/ChildModeShell.tsx` (verificación de integración en el 100% de las pantallas de Modo Niño), `app/navigation/RootNavigator.tsx` (limpieza de rutas `ComingSoon` ya no usadas), `app.json` (cambio de `orientation` a `default`, condicionado a validación pantalla por pantalla — ejecutado aquí, con aprobación separada si se requiere para tocar configuración nativa), unificación de nomenclatura "Mundo Sensorial" en toda la UI y el código (retirar "Juega & Regula" como nombre visible).

**Funcionalidades**: integración de navegación, no funcionalidades de producto nuevas.

**Pruebas**: recorrido completo de un usuario nuevo desde `WelcomeScreen` hasta usar los 5 pilares sin encontrar ningún `ComingSoonScreen`; prueba en tablet y teléfono, portrait y landscape; verificación de que la barra universal Inicio/Calma está presente y funcional en el 100% de las pantallas de Modo Niño (lista exhaustiva, no muestreo).

**Criterios de aceptación**: cero referencias a "Juega & Regula" o `ComingSoonScreen` en rutas de producto alcanzables por el usuario; Home visualmente equilibrado entre los 4 pilares (`UX_UI_SYSTEM_SPEC.md` checklist); comportamiento aceptable verificado en al menos un dispositivo tablet real u emulado a resolución de tablet.

**Riesgos**: cambiar `orientation` en `app.json` es una modificación de configuración nativa — coherente con las fases anteriores, se ejecuta con la misma cautela que cualquier cambio de este tipo (commit propio, revisión explícita antes de generar cualquier build).

---

## R10 — QA final y release candidate

**Objetivo**: verificación exhaustiva de que el producto completo cumple `docs/FUNCTIONAL_ACCEPTANCE_MATRIX.md` al 100%, dejar el repositorio listo para que una decisión posterior (fuera de este roadmap) autorice build/`versionCode`/publicación.

**Dependencias**: R1-R9 completas.

**Archivos/áreas afectadas**: ninguno de forma estructural — es verificación; puede generar commits de corrección puntual sobre hallazgos de esta fase, no features nuevas.

**Funcionalidades**: ninguna nueva — cierre de calidad.

**Pruebas**:
- Recorrido completo de `docs/FUNCTIONAL_ACCEPTANCE_MATRIX.md` fila por fila, con evidencia de prueba manual para cada una.
- Regresión completa en dispositivo físico Android (mínimo), verificación en tablet.
- Revisión de que ningún placeholder, `ComingSoonScreen` o toggle sin efecto sigue presente en ninguna ruta alcanzable.
- Revisión de `docs/GOOGLE_PLAY_COMPLIANCE.md` actualizado a la luz de todo lo construido (privacidad, permisos nuevos de micrófono, clasificación de contenido).

**Criterios de aceptación**: el porcentaje de cumplimiento funcional real (misma metodología que `POST_V7_PRODUCT_GAP_ANALYSIS.md` §13) se recalcula y debe reflejar el objetivo fijado en la aprobación de esta especificación (ver resumen ejecutivo de cierre).

**Riesgos**: la presión de "ya casi está" es el momento de mayor riesgo de repetir el error original (declarar terminado por build/lint en verde) — esta fase existe explícitamente para no repetirlo, y su criterio de aceptación es deliberadamente el más estricto de las 10 fases.

**Nota explícita de alcance**: R10 dejar el repositorio *listo* para build no autoriza ni ejecuta ningún incremento de `versionCode`, generación de `.aab`, ni cambio de configuración EAS — esas acciones requieren autorización explícita separada, igual que se exigió para esta especificación completa.

---

## Resumen de dependencias (vista rápida)

```
R1 ─┬─> R2 ─┐
    ├─> R3 ─┤
    ├─> R4 ─┼─> R7 ─┐
    ├─> R5 ─┤        │
    └─> R6 ─┘        │
                      ▼
              R2..R7 ──> R8 ──> R9 ──> R10
```

R2-R6 son, en principio, paralelizables entre sí (todas dependen solo de R1); en la práctica, con un equipo pequeño, se recomienda el orden secuencial R2→R3→R4→R5→R6 dado en este documento porque sigue el mismo orden de impacto que la auditoría original (Mi Voz ya cerca de terminado se pule primero; Mundo Sensorial, el 0% más grave, se prioriza segundo; Calma y Mi Día siguen; Centro de Adultos cierra el ciclo de producto antes de blindar datos en R7).
