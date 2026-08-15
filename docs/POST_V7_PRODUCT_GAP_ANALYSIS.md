# Auditoría de producto post-V7 — Sense & Play Adventures 360

**Fecha:** 2026-08-15
**Rama auditada:** `main` (HEAD `d639687`)
**Método:** lectura completa del código fuente real (no solo build/lint/TS), trazado manual de cada botón y cada pantalla, verificación de persistencia en `AsyncStorage`.

---

## 0. Aviso crítico previo — el producto NO está en "post-V7"

Antes de auditar pantalla por pantalla hay que dejar constancia de una discrepancia grave entre el encargo y el estado real del repositorio:

- El historial de `main` tiene **8 commits reales**: Fase 1 (arquitectura), Fase 2 (navegación/perfiles/PIN), Fase 3 (comunicador AAC), Fase 4 (constructor de frases) y una rama adicional "Mi Voz AAC Pro" que se autodenomina **"Fase 2" de un plan paralelo**. No existe ninguna fase, commit, tag ni documento que mencione "7A", "7B"…"7K" ni "V7". La única coincidencia de "7" en todo el repo es la **Fase 7 del roadmap oficial**, que sigue **sin marcar** (`docs/ROADMAP.md:20`, `- [ ] Fase 7 — Resto de juegos.`).
- `docs/ROADMAP.md` (mantenido por el propio proyecto) declara explícitamente completadas solo las Fases 1–4 y **pendientes las Fases 5 a 12**, incluyendo Modo Adulto ampliado (Fase 8), almacenamiento offline robusto (Fase 9), diseño definitivo (Fase 10), accesibilidad y pruebas (Fase 11) y el build de Google Play (Fase 12).
- `app.json`: `"version": "0.1.0"`, `"android.versionCode": 1`. No hay `eas.json` en el repo, no hay carpetas `android/`/`ios/` generadas, no hay ningún `.aab`/`.apk`. Es decir, ni siquiera se generó nunca un build instalable formal vía EAS.
- El módulo **`sensory-games`** ("Mundo Sensorial" / "Juega & Regula"), que el encargo pide auditar como si tuviera juegos jugables, **no contiene ni un solo archivo de código**: la carpeta `src/features/sensory-games/` solo tiene un `README.md` describiendo 6 juegos planeados. No existen las subcarpetas `bubble-pop/`, `sensory-paint/`, etc. que el propio README anuncia.
- No existe ningún directorio, pantalla, ni siquiera stub llamado "Calma 360" como sistema propio; lo que existe con ese nombre es una única pantalla (`CalmCommunicationScreen`) con una grilla estática de 15 frases de emergencia que hablan por TTS, más un botón que lleva al mismo placeholder `ComingSoon` de Mundo Sensorial.

**Conclusión de este punto:** el producto real corresponde a un **prototipo funcional temprano** (aprox. equivalente a Fase 4-5 de un roadmap de 12 fases), no a una "v7 declarada técnicamente completa". El resto de esta auditoría evalúa el producto tal como existe hoy, pero cualquier plan de corrección debe partir de esta base real, no de la premisa de "post-V7".

---

## 1. Inventario real de funcionalidades

| Módulo | Pantallas/archivos reales | Estado general |
|---|---|---|
| Onboarding / navegación raíz | `WelcomeScreen`, `ProfileSelectorScreen`, `HomeScreen`, `ComingSoonScreen`, `RootNavigator` | Funcional, mínimo |
| Perfiles | `ProfilesContext`, `ProfileSelectorScreen`, `ProfileFormScreen`, `ProfileCard` | Funcional |
| Modo Adulto (PIN) | `PinGateScreen`, `PinPad`, `AdultHomeScreen` | Funcional con huecos graves |
| Mi Voz (AAC) | `AacNavigator`, `AacHomeScreen`, `AacCategoryScreen`, `AacManagerScreen`, `AacCardFormScreen`, `AacSettingsScreen`, `AacSearch`, `PhraseBar`, `PhraseContext`, `CoreVocabularyRow`, `aacCardsRepository` | Mayormente funcional (ver matriz) |
| Calma 360 | `CalmCommunicationScreen`, `QuickCommunication`, `emergencyVocabulary.ts` | Parcial — es un panel de frases, no un "360" |
| Mi Día (rutinas) | `MyDayScreen`, `RoutineManagerScreen`, `RoutineFormScreen`, `useRoutines`, `routinesRepository` | Funcional (no auditado explícitamente en el encargo, pero es parte del producto real) |
| Mundo Sensorial / Juega & Regula | `src/features/sensory-games/README.md` únicamente | **No implementado — 0% de código** |
| TTS | `services/audio/speech.ts` (expo-speech) | Funcional |
| Persistencia | `services/storage/*` (AsyncStorage) | Funcional con riesgos (§8) |
| Grabaciones de voz familiares | — | **No implementado** (campo `audioUri` reservado y sin usar, `types.ts:29`) |
| Pictogramas reales (ARASAAC u otro banco) | — | **No implementado**: "pictograma" = un único emoji por tarjeta, no un sistema de símbolos AAC |

---

## 2. Matriz requisito vs. implementación

| Requisito del encargo | Clasificación | Evidencia |
|---|---|---|
| **Mi Voz — construcción real de frases** | ✅ REALMENTE FUNCIONAL | `PhraseContext.tsx` (add/removeAt/removeLast/clear/speak), `PhraseBar.tsx` tocable palabra por palabra |
| **Mi Voz — TTS** | ✅ REALMENTE FUNCIONAL | `speech.ts` con cola serializada anti-solapamiento; usa `expo-speech`, local, sin coste |
| **Mi Voz — categorías** | ✅ REALMENTE FUNCIONAL | 23 categorías reales + 3 virtuales (`categories.ts`) |
| **Mi Voz — pictogramas** | ⚠️ PARCIAL / engañoso | Solo emoji Unicode tecleado a mano por el adulto (`AacCardFormScreen.tsx:139-147`), no hay banco de símbolos AAC real (ARASAAC, SymboStix, etc.) ni buscador visual de pictogramas |
| **Mi Voz — fotografías** | ⚠️ PARCIAL — riesgo de persistencia | Se puede elegir/tomar foto (`expo-image-picker`), pero la app **guarda el URI temporal del picker tal cual**, sin copiarlo a un directorio propio de la app (no hay `expo-file-system` en `package.json`). Riesgo real de que las fotos se rompan tras limpiar caché, actualizar la app o reiniciar el dispositivo (ver §8) |
| **Mi Voz — edición de tarjetas** | ✅ REALMENTE FUNCIONAL | `AacCardFormScreen.tsx` + `AacManagerScreen.tsx` (crear/editar/eliminar/mover/favorito) |
| **Mi Voz — favoritos** | ✅ REALMENTE FUNCIONAL | Categoría virtual `FAVORITES_CATEGORY_ID`, toggle en Manager y en el form |
| **Mi Voz — recientes** | ✅ REALMENTE FUNCIONAL | Categoría virtual `RECENT_CATEGORY_ID` por `lastUsedAt` |
| **Mi Voz — más usados** | ✅ REALMENTE FUNCIONAL | Categoría virtual `MOST_USED_CATEGORY_ID` por `usageCount` |
| **Mi Voz — búsqueda** | ✅ REALMENTE FUNCIONAL | `AacSearch.tsx`, local, sobre tarjetas + vocabulario núcleo |
| **Mi Voz — grabaciones de voz familiares** | ❌ NO IMPLEMENTADO | `AacCard.audioUri` existe en el tipo pero nunca se escribe ni se reproduce en ningún lugar del código; no hay dependencia de grabación de audio instalada |
| **Mi Voz — perfiles** | ✅ REALMENTE FUNCIONAL | Aislamiento real por `profileId` en AsyncStorage (`aacCardsRepository.ts`) |
| **Mi Voz — persistencia** | ⚠️ PARCIAL | Tarjetas/preferencias persisten correctamente; **fotos con riesgo de romperse** (ver arriba); sin backup/exportación |
| **Mundo Sensorial — juegos jugables** | ❌ NO IMPLEMENTADO | 0 archivos de código; todo entry point navega a `ComingSoonScreen` (`HomeScreen.tsx:47-52`, `CalmCommunicationScreen.tsx:33-38`) |
| **Calma 360 — herramientas con interacción real** | ⚠️ SIMULADO como "360" | Lo único interactivo es tocar una de 15 frases fijas para oírlas (`QuickCommunication.tsx`). No hay respiración guiada, temporizador visual, sonidos relajantes, ni ejercicios sensoriales — pese a que el nombre "360" sugiere un kit completo de autorregulación |
| **Modo Adulto — perfiles** | ✅ REALMENTE FUNCIONAL | Alta/edición/eliminación con limpieza en cascada (`ProfilesContext.deleteProfile` + `profileDataRegistry`) |
| **Modo Adulto — configuración** | ⚠️ PARCIAL | Existen ajustes de AAC por perfil (`AacSettingsScreen`) y de rutinas, pero **no hay pantalla de ajustes generales de la app** (idioma, exportar/importar datos, política de privacidad, cambiar PIN) |
| **Modo Adulto — personalización** | ⚠️ PARCIAL | Board size, tamaño de texto, qué mostrar — todo real. Pero `reduceMotion` se guarda y nunca se lee en ningún componente (dead setting, ver §5) |
| **Modo Adulto — persistencia** | ✅ REALMENTE FUNCIONAL (con reserva de seguridad) | AsyncStorage; PIN en texto plano por diseño documentado (`pinRepository.ts:5-9`) |
| **Modo Adulto — controles** | 🔴 FALTA CRÍTICA | **No existe forma de recuperar/cambiar un PIN olvidado.** `PinGateScreen.tsx` solo contempla `enter`/`create-step1`/`create-step2`; si el adulto olvida el PIN, pierde acceso permanente a Modo Adulto sin reinstalar la app |
| **Home/Navegación — ¿app comercial o dashboard?** | ⚠️ UX DEFICIENTE | Ver §6. Se siente como una colección de pantallas CRUD, no como una app comercial pulida: sin transición/animación, sin onboarding, botón "Modo Adulto" escondido como ghost-link, "Calma" no accesible desde Home (solo desde dentro de Mi Voz) |

---

## 3. Funcionalidades faltantes (NO IMPLEMENTADO)

1. **Mundo Sensorial completo** — los 6 juegos anunciados en el propio README del módulo (Revienta burbujas, Pintura sensorial, Toca y escucha, Sigue el color, ¿Cómo me siento?, Respira conmigo): 0% de código.
2. **Grabación de voz personalizada** (familiar grabando su propia voz para una tarjeta): campo reservado, cero lógica, cero dependencia de audio de grabación.
3. **Banco de pictogramas real** (tipo ARASAAC): hoy "pictograma" = un emoji tecleado por el adulto.
4. **Selector de idioma en la UI** (el propio `docs/ARCHITECTURE.md` lo marca pendiente); `speech.ts` está preparado internamente pero no hay ningún control visible.
5. **Recuperación/cambio de PIN de adulto.**
6. **Pantalla de ajustes generales de la app** (política de privacidad, exportar/borrar datos, versión de la app) — necesaria además por `docs/GOOGLE_PLAY_COMPLIANCE.md:48-55`, que la da por pendiente.
7. **Backup / exportación / importación de datos** (perfiles, tarjetas, rutinas): si se desinstala la app o se pierde el dispositivo, todo se pierde sin aviso al usuario.
8. **Cualquier prueba automatizada**: `find . -iname "*.test.*" -o -iname "*.spec.*"` no devuelve resultados en todo el repo.
9. **Contextos rápidos de vocabulario** (Casa/Escuela/Terapia) mencionados como pendientes en `docs/AAC_PRO_FASE2_PLAN.md:88-89`.
10. **Onboarding/tutorial** para el primer uso (ni para el niño ni para el adulto que configura el PIN o el primer perfil).

---

## 4. Funcionalidades parciales (PARCIAL)

1. **Fotografías de tarjetas y de avatar de perfil** — capturan y muestran bien en la sesión actual, pero la persistencia del archivo físico no está garantizada a mediano plazo (§8).
2. **Calma 360** — el panel de frases de emergencia funciona, pero el nombre promete mucho más (autorregulación sensorial "360") de lo que hay.
3. **Reordenar tarjetas/rutinas** — funciona pero solo con flechas arriba/abajo una por una (`AacManagerScreen.tsx:78-89`, `RoutineFormScreen.tsx:126-132`); nada de arrastrar y soltar, penoso con más de 5-6 elementos.
4. **Personalización de "qué mostrar"** — todos los toggles de `AacSettingsScreen` cambian el estado y persisten, pero `reduceMotion` (definido a nivel de perfil desde la Fase 2) es un interruptor "fantasma": se guarda y nunca se consulta en ningún componente de la app.
5. **Modo Adulto → administración de perfiles** — CRUD completo, pero sin analítica ni resumen para terapeutas/padres (uso de tarjetas, progreso de rutinas, etc. — los datos existen en `usageCount`/`lastUsedAt` pero no se muestran en ninguna pantalla).

---

## 5. Placeholders (SIMULADO / PLACEHOLDER puro)

1. **`ComingSoonScreen`** — usado tal cual para "Juega & Regula" desde Home y para "Mundo Sensorial" desde Calma; es un placeholder genérico y explícito ("Esta sección estará disponible próximamente"), no un builder ni un demo.
2. **`reduceMotion`** en `ChildProfilePreferences` — placeholder de UI: el switch existe y se guarda, pero no tiene ningún efecto real, ya que ningún componente evalúa ese valor. Da al adulto una falsa sensación de control.
3. **`AacCard.audioUri`** — campo de tipo reservado sin ningún flujo de UI que lo cree, edite o reproduzca.
4. **Vocabulario "núcleo"** — funcional para hablar/agregar a la frase, pero es una lista fija en código (`coreVocabulary.ts`), no editable ni ampliable desde Modo Adulto, contrario al resto del sistema de tarjetas que sí es editable.

---

## 6. Problemas graves de UX/UI

1. **"Calma" no es alcanzable en un toque desde toda la app, solo desde dentro de "Mi Voz".** El comentario del propio código (`AacLayout.tsx:20-26`) afirma que Calma es alcanzable "desde cualquier pantalla de Mi Voz" — cierto, pero desde `HomeScreen` (fuera de Mi Voz) no hay botón de Calma directo; un niño en crisis debe primero entrar a Mi Voz y luego tocar Calma. Para una función de seguridad/emergencia esto es un diseño de alto riesgo.
2. **"Modo Adulto" es un ghost-button poco visible** al pie de `ProfileSelectorScreen` (`ProfileSelectorScreen.tsx:49-56`), sin icono destacado ni jerarquía visual acorde a su importancia (protege configuración y PIN).
3. **Sin transiciones, sin feedback de carga consistente, sin animaciones de confirmación** — cada pantalla es un `ScreenContainer` con texto y botones apilados; se percibe como una serie de formularios CRUD administrativos, no como una app comercial para niños (contradice el objetivo declarado en `docs/ARCHITECTURE.md` de evitar sensación de prototipo).
4. **Duplicación de contenido** entre `EMERGENCY_VOCABULARY` (Calma) y `SEED_DEFINITIONS` (tarjetas semilla de categoría "bathroom"/"needs"): frases como "Necesito ir al baño" / "Necesito silencio" existen en ambos sistemas con implementaciones distintas (una habla directo, otra pasa por la barra de frase), lo que puede confundir tanto al usuario como a futuro mantenimiento.
5. **Grillas con anchos fijos en píxeles** (`CategoryTile` 120, `AacCardTile` 140 por defecto, `boardSize.ts` 108-172) en vez de cálculo responsivo por `Dimensions`/`useWindowDimensions`, pese a que `app.json` declara `supportsTablet: true` en iOS: en una tablet se verá una grilla pequeña centrada con mucho espacio vacío, no un layout adaptado.
6. **Botones de acción secundarios amontonados** en `AacManagerScreen` y `RoutineFormScreen` (favorito/mover arriba/mover abajo/editar/eliminar en una sola fila con `flexWrap`) — usable pero visualmente saturado, especialmente en pantallas angostas.
7. **Sin estado vacío accionable real** — cuando no hay perfiles (`ProfileSelectorScreen`) el mensaje le dice al niño "pídele a un adulto", pero no hay atajo directo al flujo de creación (correcto por diseño de seguridad, pero no se ofrece alternativa, ej. contactar/avisar).

---

## 7. Problemas de accesibilidad

**Lo que sí está bien resuelto:**
- Área táctil mínima de 64dp declarada y aplicada en `BigButton` (`spacing.ts:23`, `BigButton.tsx:68`).
- `accessibilityRole`/`accessibilityLabel`/`accessibilityHint` presentes de forma consistente en botones, tarjetas y toggles.
- Paleta de bajo contraste "agresivo" pensada para evitar sobreestimulación (`colors.ts:1-6`) — coherente con el público objetivo, aunque no se ha validado con métricas WCAG de contraste real texto/fondo.

**Lo que falta o es dudoso:**
1. **`reduceMotion` sin efecto real** (ver §5) — declarado como necesidad de accesibilidad en `docs/ARCHITECTURE.md:19` pero no implementado en ningún componente.
2. **Sin verificación de contraste WCAG** — colores como `warning` (#E8B86D sobre fondo #FDF6EC) o `blush`/`lavender` como acentos de categoría no están auditados contra AA/AAA.
3. **Sin soporte explícito de lector de pantalla más allá de labels básicos** — no hay `accessibilityLiveRegion` para anunciar cambios (p. ej., al agregar una palabra a la frase, al guardar una tarjeta), ni orden de foco gestionado tras navegar.
4. **Tipografía en píxeles fijos** (`typography.ts:9-14`) sin verificar el comportamiento con `allowFontScaling`/ajustes del sistema operativo (no se desactiva explícitamente, pero tampoco se ha probado ni documentado cómo se comporta el layout con fuente ampliada del sistema, lo cual es crítico para accesibilidad motriz/visual).
5. **`docs/ROADMAP.md` marca la Fase 11 (Accesibilidad y pruebas) como pendiente** — es decir, el propio equipo reconoce que la accesibilidad no ha sido validada formalmente todavía.

---

## 8. Problemas de persistencia

1. **Riesgo real en fotos (avatar de perfil y foto de tarjeta AAC).** `ProfileFormScreen.tsx:44-62` y `AacCardFormScreen.tsx:58-71` guardan directamente `result.assets[0].uri` devuelto por `expo-image-picker`, sin copiarlo a un directorio propio de la app vía `expo-file-system` (dependencia inexistente en `package.json`). En Android, los URIs de cámara/galería pueden apuntar a caché temporal o a `content://` de un proveedor externo que puede revocar el permiso de lectura tras reiniciar la app; el resultado observable es una foto que "desaparece" (ícono roto) sin que el usuario entienda por qué. Esto es exactamente el tipo de bug que un usuario real detecta al usar la app en dispositivo físico, como reporta el encargo.
2. **PIN de adulto en texto plano** en AsyncStorage (`pinRepository.ts`) — documentado como decisión consciente ("barrera parental, no criptográfica"), razonable para el caso de uso, pero debe quedar explícito en la política de privacidad antes de publicar (pendiente, ver `GOOGLE_PLAY_COMPLIANCE.md:48-55`).
3. **Sin backup/exportación**: todo vive únicamente en AsyncStorage local. Desinstalar la app, cambiar de dispositivo o un "borrar datos de la app" del sistema operativo destruye perfiles, tarjetas y rutinas sin ningún mecanismo de recuperación.
4. **Migraciones de esquema informales**: los campos nuevos (`usageCount`, `active`, `speakOnTap`, etc.) se resuelven con `?? valorPorDefecto` disperso en cada componente en lugar de una capa central de migración — funciona hoy, pero es frágil a medida que el esquema crezca (riesgo de inconsistencia entre pantallas si una olvida el `??`).
5. **`getItem` traga silenciosamente JSON corrupto** devolviendo `null` (`asyncStorage.ts:9-14`) — correcto para no crashear, pero no hay ningún log ni aviso al usuario/adulto de que se perdieron datos corruptos; puede ocultar pérdida de datos real.

---

## 9. Componentes que deben eliminarse (o reescribirse desde cero, no "completarse")

- **`ComingSoonScreen` como respuesta a "Juega & Regula"/"Mundo Sensorial"**: aceptable como estado temporal de desarrollo, pero **no debe llegar a producción/tienda** tal cual — un botón grande en el Home que lleva a "próximamente" en una app publicada es una señal inmediata de producto incompleto para cualquier usuario o revisor de tienda.
- **El toggle `reduceMotion`** debe eliminarse de la UI hasta que exista una implementación real, o implementarse antes de exponerlo — un control que no hace nada es peor que no tenerlo (rompe la confianza del adulto en el resto de los ajustes).
- **Duplicación de vocabulario de emergencia vs. categoría "needs"/"bathroom"**: conviene unificar en una sola fuente de datos con una bandera "aparece en Calma" en vez de mantener dos listas independientes.

## 10. Componentes que pueden conservarse (base sólida real)

- `PhraseContext` / `PhraseBar` / `speech.ts` (cola de TTS) — arquitectura correcta y ya robusta ante toques rápidos.
- `aacCardsRepository.ts` + `useAacCards.ts` + patrón de `profileDataRegistry` para limpieza en cascada — buen patrón, extensible a futuros datos por perfil (p. ej. progreso de juegos cuando existan).
- Sistema de categorías reales + virtuales (`categories.ts`) — bien diseñado, con IDs estables para no romper datos guardados.
- `BigButton` / `ScreenContainer` / `ProfileAvatar` — base de design system coherente y accesible (64dp, labels), reutilizable para las fases futuras.
- `useRoutines` / "Mi Día" — mismo patrón sólido que AAC, funcional de punta a punta.
- Aislamiento de datos por perfil en AsyncStorage — decisión de arquitectura correcta y ya verificada (borra en cascada al eliminar perfil).

---

## 11. Propuesta concreta para transformar el producto actual en una aplicación comercial profesional

1. **Recalibrar expectativas y roadmap**: descartar la narrativa "post-V7 completo" y planificar desde el estado real (fin de Fase 4 + AAC Pro Fase 2). Comunicar internamente el % real de avance (ver §12) antes de cualquier fecha de lanzamiento.
2. **Cerrar los huecos de seguridad/UX de Modo Adulto primero** (P0, ver §12): flujo de recuperación de PIN, pantalla de ajustes generales, política de privacidad.
3. **Resolver la persistencia de imágenes** copiando cualquier foto elegida a `expo-file-system` (`documentDirectory`) en el momento de guardar la tarjeta/perfil, no solo referenciar el URI temporal del picker.
4. **Decidir el alcance real de "Mundo Sensorial" y "Calma 360" antes de programar**: o se construyen los 6 juegos y las herramientas de autorregulación reales (temporizador, respiración animada, sonidos), o se renombra/reduce el alcance del marketing interno para no prometer un "360" que no existe.
5. **Sustituir pictogramas emoji por un sistema de símbolos AAC real** (banco tipo ARASAAC con licencia adecuada) con buscador visual, no solo texto.
6. **Añadir capa de exportación/backup** (aunque sea exportar/importar un JSON firmado localmente) antes de publicar, dado el modelo 100% offline sin nube.
7. **Introducir pruebas automatizadas mínimas** (unit tests de los hooks de storage/CRUD, al menos) — hoy la cobertura es cero.
8. **Rediseño visual (Fase 10 del propio roadmap)**: layouts responsivos por tamaño real de pantalla/tablet, transiciones, y una revisión de contraste WCAG antes de considerar el producto "comercial".
9. **Sólo después de 1-8**: retomar la Fase 6-7 (juegos sensoriales) y la Fase 12 (build .aab, ficha de Play Console, Data Safety).

---

## 12. Prioridades

### P0 — bloqueante para cualquier lanzamiento, incluso beta cerrada
- Flujo de recuperación/cambio de PIN de Modo Adulto (hoy: bloqueo permanente si se olvida).
- Persistencia real de fotos (perfil y tarjetas) vía `expo-file-system`, para no perder imágenes silenciosamente.
- Quitar o reemplazar `ComingSoonScreen` como destino de botones principales del Home antes de cualquier build público.
- Política de privacidad + pantalla de ajustes generales (requisito de Play Console para apps infantiles, ya señalado como pendiente en `GOOGLE_PLAY_COMPLIANCE.md`).

### P1 — necesario para considerarse "producto comercial", no urgente para uso interno
- Implementar de verdad o eliminar `reduceMotion`.
- Backup/exportación de datos.
- Al menos 1-2 juegos reales de "Mundo Sensorial" (no los 6, pero al menos que el botón no sea un placeholder).
- Rediseño responsivo (tablets, tamaños de fuente del sistema).
- Botón de "Calma" accesible desde el Home, no solo desde dentro de Mi Voz.
- Sistema de pictogramas reales (o al menos banco de imágenes prediseñadas, no solo emoji).

### P2 — mejoras de calidad, no bloquean lanzamiento
- Drag-and-drop real para reordenar tarjetas/pasos de rutina.
- Panel de estadísticas de uso para adultos/terapeutas (los datos ya existen: `usageCount`, `lastUsedAt`).
- Selector de idioma visible en UI.
- Pruebas automatizadas y CI.
- Unificar vocabulario de Calma con categorías AAC para evitar duplicación de datos.

---

## 13. Porcentaje estimado de cumplimiento funcional real

**≈ 30-35% de un producto comercial completo**, desglosado así:

| Área | Peso relativo asumido | Cumplimiento real | Justificación |
|---|---|---|---|
| Mi Voz (AAC) | 35% | ~70% | Núcleo sólido y persistente, pero sin pictogramas reales, sin grabación de voz, con riesgo de fotos rotas |
| Mundo Sensorial | 20% | 0% | Cero código, solo README |
| Calma 360 | 10% | ~25% | Un panel de frases funcional, no un sistema de regulación |
| Mi Día | 10% | ~80% | Funcional y persistente, único módulo cercano a "terminado" |
| Modo Adulto / Perfiles | 15% | ~55% | CRUD sólido, pero sin recuperación de PIN ni ajustes generales |
| Home/Navegación/pulido comercial | 10% | ~25% | Navegación funcional pero visualmente y estructuralmente aún en fase de prototipo |

**Cálculo ponderado:** (0.35×70) + (0.20×0) + (0.10×25) + (0.10×80) + (0.15×55) + (0.10×25) = 24.5 + 0 + 2.5 + 8 + 8.25 + 2.5 = **≈ 46%** sobre el alcance completo descrito en el encargo (que incluye Mundo Sensorial y Calma 360 como sistemas completos).

Si el criterio se limita estrictamente a **lo que ya está en `main` y funciona sin humo** (excluyendo lo que el encargo asume que existe pero no está en el roadmap ni en el código, como grabaciones de voz o 6 minijuegos), el cumplimiento frente al **propio roadmap interno de 12 fases** es de **4 fases completas de 12 → 33%**.

Se reporta el rango **30-35%** como estimación conservadora y defendible con evidencia de código, no el 100% que sugeriría un "V7 técnicamente completo".

---

*Documento generado exclusivamente como auditoría. No se realizaron cambios de código, build, versionCode ni configuración EAS, conforme a lo solicitado.*
