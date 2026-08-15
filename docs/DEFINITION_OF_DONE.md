# Definición de Terminado (DoD) — Sense & Play Adventures 360

**Estado:** ESPECIFICACIÓN CERRADA para aprobación.
**Complementa:** `docs/PRODUCT_MASTER_SPEC.md`, `docs/UX_UI_SYSTEM_SPEC.md`. Este documento no repite las especificaciones funcionales ya descritas ahí — las convierte en criterios verificables.

## 0. Plantilla obligatoria

Ninguna funcionalidad de este producto se declara terminada sin responder, explícitamente, estos nueve puntos. Es la aplicación directa del principio obligatorio fijado en `PRODUCT_MASTER_SPEC.md` §0:

1. **Qué debe hacer** — en una frase, sin ambigüedad.
2. **Flujo de usuario** — pasos concretos, desde el disparador (qué toca el usuario) hasta el resultado observable.
3. **Archivos/componentes afectados** — rutas reales del repositorio (existentes o nuevas), para que la implementación no pueda "perderse" en un lugar no previsto.
4. **Datos** — qué estructura de datos nueva o modificada requiere.
5. **Persistencia** — qué se guarda, dónde (según `PRODUCT_MASTER_SPEC.md` §7), y qué pasa si el dispositivo se cierra a mitad de la operación.
6. **Edge cases** — los casos límite que, de no manejarse, producen exactamente el tipo de brecha que encontró la auditoría (botón que no hace nada, dato que no persiste, estado no contemplado).
7. **Accesibilidad** — qué exige `UX_UI_SYSTEM_SPEC.md` §5 específicamente para esta función.
8. **Prueba manual** — pasos reproducibles por una persona (no solo una suite automatizada) para verificar en dispositivo real.
9. **DONE objetivo** — la condición binaria, verificable por alguien que no escribió el código, que separa "terminado" de "no terminado".

**Regla de cierre de fase**: ninguna fase del roadmap (`REBUILD_ROADMAP_R1_R10.md`) puede marcarse completa si alguna de sus funcionalidades no cumple su propio DONE objetivo. Un placeholder, un `ComingSoonScreen`, un toggle que no se lee en ningún lado (como `reduceMotion` hoy) son, por definición, funcionalidades que no cumplen esta plantilla.

---

## 1. Funciones que YA CUMPLEN el DoD (línea base, no se redefinen)

Según la auditoría (`POST_V7_PRODUCT_GAP_ANALYSIS.md` §9), estas funciones ya son "REALMENTE FUNCIONAL" de extremo a extremo y se mantienen como base sin reescritura, solo con adaptaciones menores de integración (design system, capa de persistencia) cubiertas en sus fases correspondientes:

- Construcción de frases (`PhraseContext`/`PhraseBar`).
- TTS por defecto vía `expo-speech` (se mantiene como fallback, ver §2.2).
- CRUD de tarjetas AAC (`useAacCards`) y su aislamiento por perfil.
- Categorías, búsqueda local, favoritos, recientes, más usados.
- CRUD de perfiles y su aislamiento de datos al eliminar (`profileDataRegistry`).
- PIN de acceso a Modo Adulto (crear/verificar) — se extiende con recuperación y cambio voluntario (§6.1) pero el mecanismo base se conserva.
- Cerrar sesión de adulto (`AdultHomeScreen.tsx` "Salir de Modo Adulto") — se mantiene igual, sin cambio de comportamiento.
- CRUD de rutinas y pasos de Mi Día, indicador Primero/Después.
- Personalización AAC (tamaño de tablero/texto, qué mostrar) — se mantiene, se extiende con columnas responsivas.

Estas no tienen entrada individual abajo porque ya satisfacen la plantilla del §0 en su forma actual; su única obligación en la reconstrucción es no rebajar su nivel de terminado al integrarse con el nuevo design system y la nueva capa de datos (criterio de regresión, verificado en R9/R10).

---

## 2. Mi Voz AAC — funciones nuevas o a extender

### 2.1 Pictogramas profesionales

1. **Qué debe hacer**: mostrar un pictograma de un set profesional (no emoji) como representación visual por defecto de cada tarjeta AAC.
2. **Flujo de usuario**: en Modo Niño, el niño ve el pictograma en cada tarjeta sin acción adicional. En Modo Adulto, al crear/editar una tarjeta, un nuevo botón "Elegir pictograma" abre una grilla buscable por palabra; al seleccionar uno, se guarda como `pictogramId` en la tarjeta.
3. **Archivos/componentes**: `features/aac-communicator/components/AacCardVisual.tsx` (nueva rama de renderizado), `features/aac-communicator/screens/AacCardFormScreen.tsx` (nuevo selector), nuevo `features/aac-communicator/components/PictogramPicker.tsx`, `assets/images/pictograms/*`, nuevo `features/aac-communicator/data/pictogramIndex.ts` (índice buscable palabra→id).
4. **Datos**: `AacCard.pictogramId?: string` (nuevo campo opcional).
5. **Persistencia**: el `pictogramId` se guarda igual que cualquier otro campo de la tarjeta (capa de datos de `PRODUCT_MASTER_SPEC.md` §7); las imágenes del set van empaquetadas en el bundle de la app, no requieren persistencia por-usuario.
6. **Edge cases**: tarjeta sin `pictogramId` ni `imageUri` → cae a emoji (nunca una tarjeta sin representación visual); búsqueda de pictograma sin resultados → mensaje claro + opción de seguir con emoji.
7. **Accesibilidad**: cada pictograma tiene una descripción textual asociada para `accessibilityLabel` (ya se usa `card.label`, se mantiene — el pictograma es visual, la etiqueta de accesibilidad sigue siendo el texto de la tarjeta).
8. **Prueba manual**: crear una tarjeta nueva, asignarle un pictograma del set, verificar que se ve en Modo Niño; borrar el pictograma, verificar que cae a emoji sin romper la tarjeta.
9. **DONE objetivo**: el vocabulario semilla completo (`seedCards.ts`) y el núcleo (`coreVocabulary.ts`) usan pictogramas del set por defecto, no emoji; el 0% de "AAC con emoji genérico" señalado en la auditoría deja de ser cierto para el vocabulario que la app trae de fábrica.

### 2.2 Grabación y reproducción de voz familiar

1. **Qué debe hacer**: permitir que un adulto grabe su voz (o la de un familiar) diciendo la palabra/frase de una tarjeta, y que esa grabación se reproduzca en Modo Niño en vez del TTS al tocar la tarjeta.
2. **Flujo de usuario**: Modo Adulto → editar tarjeta → "🎙️ Grabar voz" → graba (máx. 5s) → puede escuchar/regrabar/eliminar → guardar. En Modo Niño, tocar la tarjeta reproduce la grabación si existe; si no, TTS como hoy.
3. **Archivos/componentes**: `services/audio/recorder.ts` (nuevo, sobre `expo-audio`), `features/aac-communicator/screens/AacCardFormScreen.tsx` (nuevos controles), `services/audio/speech.ts` (extender `speak`/lógica de reproducción para decidir audio-grabado vs. TTS).
4. **Datos**: `AacCard.audioUri` (ya existe como campo reservado, se activa).
5. **Persistencia**: archivo de audio real en `expo-file-system` (documento directory), ruta guardada en `audioUri`; se borra junto con el perfil (extensión de `profileDataRegistry`).
6. **Edge cases**: archivo de audio referenciado que ya no existe en disco (borrado externamente, corrupción) → caer a TTS automáticamente sin error visible al niño; permiso de micrófono denegado → mensaje claro en Modo Adulto, TTS sigue funcionando igual (esta función nunca bloquea el uso básico del comunicador).
7. **Accesibilidad**: control de grabación con `accessibilityLabel`/`accessibilityHint` claros ("Grabar voz para esta tarjeta", "Detener grabación"); indicador visual de "grabando" no dependiente solo de color.
8. **Prueba manual**: grabar una palabra, salir a Modo Niño, tocar la tarjeta, confirmar que se oye la grabación y no el TTS; eliminar la grabación desde Modo Adulto, confirmar que vuelve a sonar TTS.
9. **DONE objetivo**: al menos una tarjeta con audio grabado se reproduce correctamente en Modo Niño tras cerrar y reabrir la app (persistencia real, no solo en memoria de la sesión).

### 2.3 Selector de idioma/voz de TTS

1. **Qué debe hacer**: permitir elegir, por perfil, el idioma/voz de síntesis entre los disponibles en el dispositivo.
2. **Flujo de usuario**: Centro de Adultos → Mi Voz → Ajustes → "Idioma y voz" → lista de voces disponibles (`Speech.getAvailableVoicesAsync()`) → seleccionar → se guarda en el perfil.
3. **Archivos/componentes**: `features/aac-communicator/screens/AacSettingsScreen.tsx` (nueva sección), `services/audio/speech.ts` (usar `preferences.speechLanguage`/`voiceId` en cada `speak()`).
4. **Datos**: `ChildProfilePreferences.speechLanguage?: string`, `speechVoiceId?: string`.
5. **Persistencia**: junto al resto de preferencias del perfil.
6. **Edge cases**: dispositivo sin voces adicionales instaladas → mostrar solo la(s) disponible(s), nunca una lista vacía sin explicación; voz seleccionada que deja de estar disponible (desinstalada del SO) → fallback silencioso al idioma por defecto (`es-ES`).
7. **Accesibilidad**: lista de voces navegable y anunciable individualmente por lector de pantalla.
8. **Prueba manual**: cambiar la voz/idioma en un perfil, volver a Mi Voz, tocar una tarjeta, confirmar auditivamente el cambio.
9. **DONE objetivo**: el idioma configurado persiste entre sesiones y efectivamente cambia el audio producido, verificado en dispositivo con al menos dos voces instaladas.

### 2.4 Contextos rápidos

1. **Qué debe hacer**: permitir filtrar/priorizar tarjetas por contexto de uso (Casa/Escuela/Terapia/Salidas) sin duplicar datos.
2. **Flujo de usuario**: Modo Adulto asigna 0+ contextos a cada tarjeta al crearla/editarla; en Modo Niño, un selector en `AacHomeScreen` activa un contexto que reordena/resalta las tarjetas de ese contexto primero dentro de cada categoría.
3. **Archivos/componentes**: `features/aac-communicator/screens/AacCardFormScreen.tsx` (selector de contextos), `features/aac-communicator/screens/AacHomeScreen.tsx` (selector de contexto activo + reordenamiento), `features/aac-communicator/constants/contexts.ts` (nuevo).
4. **Datos**: `AacCard.contexts?: string[]`.
5. **Persistencia**: junto al resto de la tarjeta.
6. **Edge cases**: tarjeta sin contexto asignado → sigue siendo visible siempre (nunca se oculta, solo se reordena); contexto activo sin ninguna tarjeta asignada → la categoría se ve igual que sin filtro, sin pantalla vacía confusa.
7. **Accesibilidad**: el contexto activo se anuncia claramente ("Contexto: Escuela, activo") al cambiarlo.
8. **Prueba manual**: asignar contexto "Escuela" a 3 tarjetas, activar ese contexto en Modo Niño, confirmar que aparecen primero dentro de su categoría sin ocultar las demás.
9. **DONE objetivo**: cambiar de contexto no pierde ni oculta ninguna tarjeta existente, solo reordena.

---

## 3. Mundo Sensorial — las seis experiencias

Cada uno de los 6 juegos comparte la misma estructura de DoD; se detalla una vez en profundidad (Revienta Burbujas, como referencia completa) y se listan los criterios diferenciales de los otros cinco para no repetir lo idéntico.

### 3.1 Revienta Burbujas (entrada de referencia completa)

1. **Qué debe hacer**: mostrar burbujas que el niño puede reventar tocándolas, en una sesión libre sin fin ni puntaje de derrota.
2. **Flujo de usuario**: Home → Mundo Sensorial → "Revienta Burbujas" → burbujas aparecen y suben → tocar revienta con animación+sonido → sesión continúa hasta que el niño toca "🏠 Inicio" o "😌 Calma" en la barra universal.
3. **Archivos/componentes**: `features/sensory-games/bubble-pop/screens/BubblePopScreen.tsx`, `features/sensory-games/bubble-pop/components/Bubble.tsx`, `features/sensory-games/shared/GameShell.tsx` (nuevo componente compartido por los 6 juegos: barra universal + pausa + lectura de `reduceMotion`/`soundEnabled`), `features/sensory-games/shared/gameSettingsRepository.ts` (config por perfil y por juego).
4. **Datos**: `SensoryGameSettings { gameId, maxConcurrentItems, speed, palette }` por perfil.
5. **Persistencia**: la configuración de cada juego persiste por perfil (capa de `PRODUCT_MASTER_SPEC.md` §7); el progreso de la sesión en curso **no** se persiste entre aperturas (es una sesión libre, no un progreso a retomar — decisión explícita, evita la falsa expectativa de "continuar donde quedé" en algo que no tiene un objetivo de completitud).
6. **Edge cases**: `reduceMotion` activo → burbujas estáticas (no suben) según `PRODUCT_MASTER_SPEC.md` §3.1; `soundEnabled` desactivado → sin sonido "pop", refuerzo visual (partículas) sigue intacto; salir a mitad de una animación de partículas no debe crashear ni dejar el juego en estado inconsistente si se reabre.
7. **Accesibilidad**: cada burbuja es un elemento tocable con `accessibilityRole="button"` y `accessibilityLabel` genérico ("Burbuja"); el juego en sí no depende de coordinación visual fina exclusivamente (área táctil de cada burbuja ≥ `minTouchTarget`).
8. **Prueba manual**: abrir el juego, reventar 5 burbujas, activar `reduceMotion` desde Centro de Adultos y confirmar que las burbujas dejan de moverse, salir con el botón universal a mitad de sesión y confirmar retorno inmediato a Home.
9. **DONE objetivo**: el juego es jugable de forma continua durante al menos 2 minutos sin errores, congelamientos, ni caída de framerate perceptible, con y sin `reduceMotion`.

### 3.2-3.6 Los otros cinco juegos (criterios diferenciales)

Todos comparten `GameShell`, el patrón de configuración por perfil, y los mismos 9 puntos de la plantilla aplicados a su mecánica específica (`PRODUCT_MASTER_SPEC.md` §3.2-§3.6). DONE objetivo específico de cada uno:

| Juego | DONE objetivo específico |
|---|---|
| Sigue la Luz | El niño puede seguir la luz con el dedo durante al menos un patrón completo sin que el juego marque "error" en ningún momento; con `reduceMotion`, el patrón continuo se convierte en puntos discretos tocables. |
| Colores y Formas | Al menos 3 rondas consecutivas completables sin temporizador de presión; tocar una opción incorrecta nunca muestra refuerzo negativo (verificado explícitamente, no solo por ausencia de bugs). |
| Trazos Calmados | El lienzo registra trazos fluidos sin lag perceptible en un dispositivo de gama media; "Limpiar lienzo" requiere confirmación explícita (no se puede perder el dibujo por accidente). |
| Clasificación Visual | Un objeto soltado en la zona incorrecta vuelve visualmente al centro sin mensaje negativo; en tablet, las zonas de destino son perceptiblemente más grandes que en teléfono (verificable comparando ambos). |
| Ritmo Suave | El patrón se puede completar guiándose solo por lo visual con `soundEnabled` desactivado (criterio de accesibilidad auditiva, no solo de preferencia). |

---

## 4. Calma 360 — funciones nuevas

### 4.1 Respiración visual guiada

1. **Qué debe hacer**: guiar un ciclo de respiración (inhalar/sostener/exhalar) con una burbuja animada y temporizador visual.
2. **Flujo de usuario**: Home → Calma → "Respiración guiada" → elegir preset o usar el default del perfil → la burbuja crece/encoge sincronizada con las fases → el niño sigue el ritmo → puede detenerse en cualquier momento sin confirmación.
3. **Archivos/componentes**: `features/calm-mode/screens/BreathingScreen.tsx` (nuevo), `features/calm-mode/components/BreathingBubble.tsx` (nuevo, `Animated`), `features/calm-mode/data/breathingPresets.ts`.
4. **Datos**: `BreathingPreset { inhaleSeconds, holdSeconds, exhaleSeconds, cycles }`; `ChildProfilePreferences.defaultBreathingPreset?`.
5. **Persistencia**: el preset por perfil se guarda; el progreso de una sesión de respiración en curso no se persiste (igual criterio que Mundo Sensorial, §3.1.5).
6. **Edge cases**: `reduceMotion` activo → la burbuja cambia de tamaño en pasos discretos por fase, no interpolación continua (`PRODUCT_MASTER_SPEC.md` §4.2); salir a mitad de un ciclo no dejará sonido o temporizador corriendo en segundo plano.
7. **Accesibilidad**: la fase actual ("Inhala", "Sostén", "Exhala") se anuncia también como texto, no solo mediante el tamaño de la burbuja (para lector de pantalla y para niños que no procesan bien la métrica puramente visual).
8. **Prueba manual**: completar un ciclo completo de 3 fases, confirmar que el texto de fase cambia junto con la burbuja, salir a mitad de fase y confirmar que no queda ningún sonido/temporizador corriendo tras salir.
9. **DONE objetivo**: un ciclo completo (inhalar→sostener→exhalar) se ejecuta con temporización correcta verificada con cronómetro externo, con y sin `reduceMotion`.

### 4.2 Pantalla de baja estimulación

1. **Qué debe hacer**: ofrecer una pantalla casi vacía de mínima exigencia cognitiva como opción de calma de último recurso.
2. **Flujo de usuario**: Calma → "Espacio tranquilo" → pantalla de un solo color + botón grande de salida, nada más.
3. **Archivos/componentes**: `features/calm-mode/screens/LowStimulationScreen.tsx` (nuevo).
4. **Datos**: color preferido opcional en preferencias de perfil.
5. **Persistencia**: solo la preferencia de color, si se configura.
6. **Edge cases**: ninguno relevante — es intencionalmente la pantalla más simple del producto.
7. **Accesibilidad**: el único botón visible tiene área táctil ≥64dp y `accessibilityLabel` claro ("Salir del espacio tranquilo").
8. **Prueba manual**: entrar y salir, confirmar que no hay ningún otro elemento interactivo ni sonido no solicitado.
9. **DONE objetivo**: la pantalla no dispara ningún sonido, animación ni notificación sin acción explícita del usuario.

### 4.3 Sonidos calmantes

1. **Qué debe hacer**: reproducir pistas de ambiente en bucle con control de volumen propio.
2. **Flujo de usuario**: Calma → "Sonidos" → elegir pista → se reproduce en bucle → control deslizante de volumen → detener/salir.
3. **Archivos/componentes**: `features/calm-mode/screens/CalmSoundsScreen.tsx`, `assets/sounds/*` (pistas nuevas), `services/audio/ambientPlayer.ts` (nuevo, sobre `expo-audio`).
4. **Datos**: `ChildProfilePreferences.maxAmbientVolume?` (tope configurable por adulto).
5. **Persistencia**: solo la preferencia de volumen máximo.
6. **Edge cases**: salir de la pantalla debe detener la reproducción siempre (nunca sonido de fondo "fantasma" tras navegar a otra sección); volumen del sistema en 0 no debe interpretarse como error.
7. **Accesibilidad**: control de volumen operable también por incrementos discretos (no solo arrastre de slider), para motricidad fina limitada.
8. **Prueba manual**: reproducir una pista, navegar a Home, confirmar que el sonido se detuvo.
9. **DONE objetivo**: cero reproducción de audio fuera de la pantalla de Sonidos Calmantes, verificado navegando fuera mientras suena.

---

## 5. Mi Día — extensiones

### 5.1 Reinicio automático diario

1. **Qué debe hacer**: reiniciar automáticamente los pasos de una rutina marcada `resetPolicy: 'daily'` al detectar que cambió el día.
2. **Flujo de usuario**: el niño abre Mi Día un día distinto al último uso → la rutina de ayer aparece con todos los pasos sin marcar, sin que nadie haya tocado "Reiniciar".
3. **Archivos/componentes**: `features/daily-routine/hooks/useRoutines.ts` (lógica de comparación de fecha al cargar), `features/daily-routine/types.ts` (`resetPolicy`, `lastResetAt`).
4. **Datos**: `DailyRoutine.resetPolicy: 'manual' | 'daily'`, `DailyRoutine.lastResetAt: string`.
5. **Persistencia**: `lastResetAt` se actualiza cada vez que ocurre un reinicio (automático o manual).
6. **Edge cases**: cambio de zona horaria o reloj del dispositivo alterado manualmente hacia atrás → no debe generar reinicios múltiples en el mismo día ni bucles; una rutina completada varias veces el mismo día (uso legítimo) no debe reiniciarse sola entre esos usos, solo al cambiar de día calendario.
7. **Accesibilidad**: sin implicancia directa; el botón manual de reinicio sigue disponible y accesible igual que hoy.
8. **Prueba manual**: completar una rutina, cambiar la fecha del dispositivo al día siguiente, reabrir Mi Día, confirmar reinicio automático sin tocar nada.
9. **DONE objetivo**: una rutina `daily` nunca requiere intervención manual para reflejar un nuevo día, verificado con cambio de fecha real del dispositivo (no simulado en memoria).

### 5.2 Fotografías y pictogramas por paso

1. **Qué debe hacer**: permitir que cada paso de una rutina use una foto o pictograma en vez de solo emoji.
2. **Flujo de usuario**: Centro de Adultos → editar rutina → editar paso → elegir foto/pictograma igual que en una tarjeta AAC.
3. **Archivos/componentes**: `features/daily-routine/screens/RoutineFormScreen.tsx`, `features/daily-routine/types.ts` (`RoutineStep.imageUri?`, `pictogramId?`).
4. **Datos**: ver arriba.
5. **Persistencia**: igual patrón que tarjetas AAC (§7 de `PRODUCT_MASTER_SPEC.md`).
6. **Edge cases**: paso sin foto ni pictograma → cae a emoji (igual regla de prioridad que tarjetas AAC).
7. **Accesibilidad**: sin cambio respecto al patrón ya usado en tarjetas AAC.
8. **Prueba manual**: asignar una foto a un paso, confirmar que se ve en Mi Día (Modo Niño).
9. **DONE objetivo**: un paso con foto persiste correctamente tras cerrar y reabrir la app.

---

## 6. Centro de Adultos — funciones nuevas

### 6.1 Recuperación y cambio de PIN

Dos flujos distintos comparten esta entrada porque comparten mecanismo de fondo (`pinRepository.ts`), pero son casos de uso diferentes y ambos deben estar cubiertos: **(a) recuperación** (el adulto olvidó el PIN, no puede autenticarse) y **(b) cambio voluntario** (el adulto está autenticado y quiere fijar un PIN nuevo por preferencia, sin haberlo olvidado).

#### (a) Recuperación de PIN olvidado

1. **Qué debe hacer**: permitir a un adulto recuperar el acceso si olvida el PIN, sin perder datos.
2. **Flujo de usuario**: al crear el PIN por primera vez, se genera/guarda un código de recuperación que el adulto debe conservar fuera de la app. En `PinGateScreen`, "¿Olvidaste tu PIN?" → ingresar código de recuperación → fijar PIN nuevo.
3. **Archivos/componentes**: `features/parent-mode/screens/PinGateScreen.tsx` (nuevo flujo), `features/parent-mode/screens/PinRecoveryScreen.tsx` (nuevo), `services/storage/pinRepository.ts` (guardar hash del código de recuperación, no el código en claro).
4. **Datos**: `recoveryCodeHash` almacenado junto al PIN (hasheado, no en texto plano — ver `PRODUCT_MASTER_SPEC.md` §7.3.5).
5. **Persistencia**: junto al PIN, en la capa de datos definida en §7.
6. **Edge cases**: adulto que también pierde el código de recuperación → única salida documentada es la eliminación total de datos desde fuera de la app (desinstalar/borrar datos del SO) — se comunica esto claramente en la pantalla de configuración del PIN, para que la expectativa sea correcta desde el principio.
7. **Accesibilidad**: pantalla de recuperación con el mismo estándar de `PinPad`/formularios ya usado en el resto de la app.
8. **Prueba manual**: crear un PIN, "olvidarlo" intencionalmente, usar el código de recuperación, confirmar que los perfiles/datos existentes siguen intactos tras fijar un PIN nuevo.
9. **DONE objetivo**: recuperar el PIN nunca borra perfiles, tarjetas ni rutinas existentes.

#### (b) Cambio voluntario de PIN

1. **Qué debe hacer**: permitir que un adulto ya autenticado en Centro de Adultos fije un PIN nuevo sin pasar por el flujo de recuperación.
2. **Flujo de usuario**: Centro de Adultos → "Cambiar PIN" → ingresar PIN actual (confirmación de identidad, ya autenticado por sesión pero se re-pide por tratarse de una acción sensible) → ingresar PIN nuevo dos veces → guardar.
3. **Archivos/componentes**: `features/parent-mode/screens/AdultHomeScreen.tsx` (entrada de menú), `features/parent-mode/screens/ChangePinScreen.tsx` (nuevo), `services/storage/pinRepository.ts` (reutiliza `setAdultPin` ya existente).
4. **Datos**: mismo campo de PIN hasheado que ya existe; no requiere estructura nueva.
5. **Persistencia**: sobrescribe el hash de PIN existente; el código de recuperación de §6.1(a) no cambia automáticamente (se ofrece, no se obliga, regenerarlo en la misma pantalla).
6. **Edge cases**: PIN nuevo igual al anterior → se permite (no es un error, aunque no cambie nada); confirmación de PIN nuevo no coincide → error claro, no se guarda nada.
7. **Accesibilidad**: mismo estándar de `PinPad` ya usado en el resto de la app.
8. **Prueba manual**: cambiar el PIN, cerrar sesión de adulto, verificar que el PIN anterior ya no funciona y el nuevo sí.
9. **DONE objetivo**: el PIN nuevo reemplaza al anterior de forma inmediata y persistente, verificado cerrando y reabriendo la app.

### 6.2 Copia de seguridad (exportar/importar)

Ver especificación funcional completa en `PRODUCT_MASTER_SPEC.md` §7.4.

1. **Qué debe hacer**: exportar todos los datos del dispositivo (o de un perfil) a un archivo `.sp360backup`, e importarlo de vuelta.
2. **Flujo de usuario**: Centro de Adultos → Copia de seguridad → "Exportar todo" o "Exportar perfil" → hoja de compartir nativa. Para restaurar: "Importar" → elegir archivo → elegir reemplazar/agregar → confirmar.
3. **Archivos/componentes**: `features/parent-mode/screens/BackupScreen.tsx` (nuevo), `services/backup/exportBackup.ts`, `services/backup/importBackup.ts` (nuevos, sobre `expo-file-system` + `expo-sharing`).
4. **Datos**: estructura de archivo `.sp360backup` versionada (incluye `schemaVersion`).
5. **Persistencia**: el archivo exportado vive fuera del control de la app una vez compartido (responsabilidad del usuario); la importación escribe a través de la misma capa de repositorio que cualquier otra escritura (transaccional, ver §7.3).
6. **Edge cases**: archivo de una versión de esquema anterior → se migra antes de importar; archivo corrupto/inválido → mensaje de error claro, **sin tocar los datos existentes del dispositivo** (la importación debe ser atómica: todo o nada); importar sin espacio de almacenamiento suficiente → error claro antes de empezar a escribir, no a mitad de la operación.
7. **Accesibilidad**: proceso con estados de carga/confirmación visibles y anunciables (no solo un spinner mudo).
8. **Prueba manual**: exportar, borrar un perfil de prueba, importar el backup, confirmar que el perfil vuelve con sus tarjetas, fotos y audios intactos.
9. **DONE objetivo**: un ciclo completo exportar→borrar todo→importar recupera el 100% de los datos (perfiles, tarjetas, fotos, audios, rutinas, preferencias), verificado por comparación antes/después.

### 6.3 Privacidad y eliminación de datos

1. **Qué debe hacer**: mostrar qué se guarda, confirmar que nada sale del dispositivo, y permitir borrar todo con confirmación fuerte.
2. **Flujo de usuario**: Centro de Adultos → Privacidad y datos → lectura de la declaración → "Eliminar todos los datos" → doble confirmación explícita (escribir una palabra de confirmación o dos pasos de `Alert`) → borrado total.
3. **Archivos/componentes**: `features/parent-mode/screens/PrivacyScreen.tsx` (nuevo), `services/storage/wipeAllData.ts` (nuevo).
4. **Datos**: n/a (es una acción, no un dato nuevo).
5. **Persistencia**: borra la base de datos completa y todos los archivos de medios asociados.
6. **Edge cases**: interrupción a mitad del borrado (app cerrada por el SO) → al reabrir, debe completar el borrado o quedar en un estado consistente, nunca a medias con datos huérfanos.
7. **Accesibilidad**: confirmación con lenguaje simple y directo, sin doble negativos confusos.
8. **Prueba manual**: ejecutar la eliminación total, confirmar que la app vuelve al estado de "sin perfiles" (`WelcomeScreen`/`ProfileSelectorScreen` vacío) y que ningún archivo de medios queda huérfano en el sistema de archivos.
9. **DONE objetivo**: tras eliminar todo, la app se comporta exactamente como una instalación nueva.

---

## 7. Navegación y Home

### 7.1 Barra universal Inicio/Calma

1. **Qué debe hacer**: ofrecer acceso de un toque a Home y a Calma 360 desde toda pantalla de Modo Niño.
2. **Flujo de usuario**: visible y funcional en Home, todas las subpantallas de Mi Voz, los 6 juegos de Mundo Sensorial, y Mi Día.
3. **Archivos/componentes**: nuevo `shared/components/ChildModeShell.tsx` (envuelve toda pantalla de Modo Niño, reemplaza el uso disperso de `ScreenContainer` en esas pantallas), integrado en cada navegador de Modo Niño.
4. **Datos**: n/a.
5. **Persistencia**: n/a.
6. **Edge cases**: no debe tapar contenido interactivo importante (p. ej. el lienzo de Trazos Calmados) — se especifica como barra fija de altura reservada, no superpuesta.
7. **Accesibilidad**: ambos botones con `accessibilityLabel` explícito y área táctil ≥64dp, alcanzables por navegación de foco antes que el contenido de la pantalla (para que un usuario de switch/teclado externo no tenga que atravesar todo el contenido para salir).
8. **Prueba manual**: desde cada una de las ~15 pantallas de Modo Niño, confirmar que ambos botones están presentes y funcionan.
9. **DONE objetivo**: verificado el 100% de las pantallas de Modo Niño (lista exhaustiva en `FUNCTIONAL_ACCEPTANCE_MATRIX.md`), no una muestra parcial.

---

## 8. Persistencia y accesibilidad transversal

### 8.1 Migración de capa de datos a SQLite

Ver `PRODUCT_MASTER_SPEC.md` §7.3. DONE objetivo: los hooks (`useAacCards`, `useRoutines`, `ProfilesContext`) exponen exactamente la misma interfaz pública que hoy (cero cambios de props/API en los componentes de UI que los consumen) tras la migración, verificado porque ninguna pantalla existente requiere modificación para seguir funcionando.

### 8.2 `reduceMotion` real

Ver `UX_UI_SYSTEM_SPEC.md` §5.5. DONE objetivo: con el toggle activo, medido en dispositivo, ninguna animación de la app (Calma 360, Mundo Sensorial, transiciones de navegación) supera la duración de un cambio de estado instantáneo — este es el criterio que cierra directamente el hallazgo de "placeholder" de la auditoría original.
