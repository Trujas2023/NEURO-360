# Auditoría de producto post-V7 — Gap Analysis

**Fecha:** 2026-08-15
**Alcance:** estado real de `main` (commit `d639687`), inspeccionado archivo por
archivo, pantalla por pantalla, siguiendo el flujo real de navegación y
persistencia. No se ejecutó build ni se modificó ningún archivo de
configuración (versionCode, EAS, app.json) como parte de esta auditoría.

**Método:** lectura completa de los ~70 archivos fuente de `src/`, seguimiento
manual de cada `onPress` hasta su efecto final (persistencia, TTS, navegación
o ausencia de efecto), y verificación cruzada con `docs/ROADMAP.md`,
`docs/AAC_PRO_FASE2_PLAN.md` y `docs/ARCHITECTURE.md`, que ya documentan —
en la propia rama — varios de los huecos confirmados abajo.

**Corrección de expectativa de partida:** el enunciado de esta auditoría
asume una implementación "7A–7K declarada completa". Eso no corresponde al
estado real de este repositorio: `git log` muestra únicamente Fase 1 a Fase 4
del `ROADMAP.md` (arquitectura, navegación/perfiles, comunicador AAC,
constructor de frases) más una pasada adicional "Mi Voz AAC Pro" que
amplió el comunicador. **Las Fases 5 (parcial), 6, 7, 8 (parcial), 9, 10, 11
y 12 del propio roadmap del proyecto siguen sin marcar como completas**, y el
código confirma exactamente eso. No hay ninguna fase "7A–7K" en el
historial; se audita el producto tal como existe, no la etiqueta.

---

## 1. Inventario real de funcionalidades

| Pantalla / módulo | Ruta en `RootNavigator` | ¿Qué hace realmente al tocar cada control? |
| --- | --- | --- |
| Bienvenida | `Welcome` | Un botón "Comenzar" → navega a selector de perfil. Sin lógica adicional. |
| Selector de perfil | `ProfileSelector` | Lista perfiles reales desde AsyncStorage; tocar uno activa sesión y navega a Home. Botón "Modo Adulto" → PIN. Estado vacío con mensaje si no hay perfiles. |
| Alta/edición de perfil | `ProfileForm` | Formulario real: nombre, foto (cámara/galería vía `expo-image-picker`) o color de avatar, 2 switches (`soundEnabled` funcional, `reduceMotion` **inerte**, ver §5). Persiste en AsyncStorage. |
| Home (Modo Niño) | `Home` | 3 botones: "Mi Voz" (real), "Juega & Regula" (→ `ComingSoonScreen`, **no implementado**), "Mi Día" (real). "Cambiar perfil" funcional. |
| Mi Voz — Inicio | `AacCommunicator` → `AacHome` | Vocabulario núcleo (24 palabras), buscador, categorías reales + virtuales (Favoritos/Más usados). Cada tarjeta habla y se agrega a la frase. |
| Mi Voz — Categoría | `AacCategory` | Grilla de tarjetas de una categoría (o Favoritos/Más usados/Recientes), tocar tarjeta habla + agrega a frase + incrementa contador de uso. |
| Mi Voz — Calma | `AacCalm` | 15 frases de emergencia, cada una habla al instante. Botón "Ir a Mundo Sensorial" → `ComingSoonScreen` (**no implementado**). |
| Mi Día | `MyDay` | Lista de rutinas (2 sembradas por defecto), cada rutina abre sus pasos con indicador PRIMERO/DESPUÉS, botón "Hecho" persiste, "Reiniciar rutina" persiste. |
| Modo Adulto — PIN | `PinGate` | Crear PIN (2 pasos, confirmación) o verificarlo. Sin recuperación si se olvida (ver §6). |
| Modo Adulto — Home | `AdultHome` | Lista de perfiles con acciones: Tarjetas, Ajustes AAC, Mi Día, Editar, Eliminar (con confirmación). "Agregar perfil". No hay ajustes globales de la app (idioma, privacidad, about). |
| Modo Adulto — Gestor de tarjetas | `AacManager` | CRUD real de tarjetas por perfil: crear, editar, eliminar (con confirmación configurable), favorito, reordenar arriba/abajo. |
| Modo Adulto — Formulario de tarjeta | `AacCardForm` | Foto (cámara/galería), emoji de texto libre, categoría, color, favorito. Guarda en AsyncStorage. |
| Modo Adulto — Ajustes de Mi Voz | `AacSettings` | 12 preferencias reales por perfil (tamaño de tablero, tamaño de texto, qué mostrar, hablar al tocar, confirmar antes de borrar). Todas persisten y se leen en las pantallas de Modo Niño. |
| Modo Adulto — Gestor de rutinas | `RoutineManager` / `RoutineForm` | CRUD real de rutinas y pasos (texto + emoji, sin foto/audio). |
| Mundo Sensorial / Juega & Regula | — | **No existe como módulo.** `src/features/sensory-games/` solo tiene un `README.md` describiendo 6 juegos planeados; cero componentes, cero pantallas, cero lógica. |

---

## 2. Matriz requisito vs. implementación

| Requisito (según el pedido de auditoría) | Estado | Evidencia |
| --- | --- | --- |
| Mi Voz — construcción real de frases | ✅ REALMENTE FUNCIONAL | `PhraseContext.tsx`, `PhraseBar.tsx`: agregar, quitar individual, borrar última, limpiar, hablar frase completa con cola anti-solapamiento. |
| Mi Voz — TTS | ✅ REALMENTE FUNCIONAL | `services/audio/speech.ts` envuelve `expo-speech`, cola serializada, idioma fijo `es-ES`. |
| Mi Voz — categorías | ✅ REALMENTE FUNCIONAL (con hueco de contenido) | `constants/categories.ts`: 22 categorías reales + 3 virtuales. **Pero 10 de las 22 no tienen ninguna tarjeta sembrada** (`constants/seedCards.ts` solo cubre 12 categorías originales) → quedan vacías hasta que un adulto cargue tarjetas manualmente. |
| Mi Voz — pictogramas | ⚠️ PARCIAL | No hay biblioteca de pictogramas curada (tipo ARASAAC/SymbolStix, estándar en apps AAC profesionales). "Pictograma" = un `TextInput` de emoji libre (`AacCardFormScreen.tsx:139-147`). Cualquier carácter Unicode es válido; no hay selector visual de símbolos. |
| Mi Voz — fotografías | ✅ REALMENTE FUNCIONAL | `expo-image-picker`, cámara y galería, en tarjetas y en avatares de perfil. |
| Mi Voz — edición | ✅ REALMENTE FUNCIONAL | `AacManagerScreen` + `AacCardFormScreen`: crear/editar/eliminar/reordenar/favorito. |
| Mi Voz — favoritos | ✅ REALMENTE FUNCIONAL | Categoría virtual + toggle persistente. |
| Mi Voz — recientes | ✅ REALMENTE FUNCIONAL | Ordenado por `lastUsedAt`, actualizado en cada uso. |
| Mi Voz — búsqueda | ✅ REALMENTE FUNCIONAL | `AacSearch.tsx`, local, sobre tarjetas + vocabulario núcleo. |
| Mi Voz — grabaciones familiares (voz de padres) | ❌ NO IMPLEMENTADO | Cero dependencia de audio de grabación en `package.json`. Campo `AacCard.audioUri` reservado en el tipo pero nunca asignado ni leído en ningún componente. Documentado como pendiente en `docs/AAC_PRO_FASE2_PLAN.md:81-87`. |
| Mi Voz — perfiles | ✅ REALMENTE FUNCIONAL | `ProfilesContext`, aislamiento real por `profileId`, limpieza de datos huérfanos al borrar perfil (`profileDataRegistry.ts`). |
| Mi Voz — persistencia | ✅ REALMENTE FUNCIONAL (con reservas, ver §8) | AsyncStorage, claves por perfil, manejo de `JSON.parse` corrupto. |
| Mundo Sensorial — juegos jugables | ❌ NO IMPLEMENTADO (0 de 6) | `src/features/sensory-games/README.md` es el único archivo del módulo. El botón "Juega & Regula" en Home y el enlace desde Calma 360 navegan al mismo `ComingSoonScreen` genérico. |
| Calma 360 — herramientas con interacción real | ⚠️ PARCIAL | Solo existe **una** herramienta: una grilla de 15 frases que hablan al tocarlas (`QuickCommunication.tsx`), funcionalmente idéntica al patrón de tarjetas AAC ya visto en "Mi Voz" (duplicación de patrón, no una herramienta de autorregulación distinta). No hay respiración guiada, temporizador visual, ni herramienta sensorial/táctil — pese a que el nombre "Calma 360" y el enlace "Ir a Mundo Sensorial" prometen un kit más amplio. |
| Modo Adulto — perfiles | ✅ REALMENTE FUNCIONAL | Alta/edición/eliminación con confirmación. |
| Modo Adulto — configuración/personalización | ⚠️ PARCIAL | Existe personalización **por perfil** (AAC, rutinas). No existe ninguna configuración **global de la app** (idioma, política de privacidad, about, exportar/respaldar datos, cambiar PIN, recuperar PIN). |
| Modo Adulto — persistencia | ✅ REALMENTE FUNCIONAL | Ver §8 para reservas (PIN en texto plano, sin backup). |
| Home/Navegación — ¿app comercial o prototipo? | ⚠️ UX DEFICIENTE | Navegación técnica sólida (`react-navigation` nativo, sin errores de flujo), pero **iconos y splash son los assets por defecto de la plantilla de Expo, sin personalizar** (verificado visualmente, ver §6). Un tercio de la Home (el botón central "Juega & Regula") no hace nada. |

---

## 3. Funcionalidades faltantes (NO IMPLEMENTADO)

1. **Mundo Sensorial / "Juega & Regula" completo**: los 6 minijuegos prometidos
   (Revienta burbujas, Pintura sensorial, Toca y escucha, Sigue el color,
   ¿Cómo me siento?, Respira conmigo) — cero código. Esto es 1 de los 3
   botones principales de la Home y una de las 3 áreas nombradas
   explícitamente en el pedido de auditoría.
2. **Grabación de voz personalizada** (voz familiar) en tarjetas AAC.
3. **Recuperación/cambio de PIN de adulto** — si se olvida, no hay flujo de
   reseteo visible en ninguna pantalla; la única salida es borrar los datos
   de la app (perdiendo perfiles, tarjetas y rutinas).
4. **Configuración global de la app**: no existe pantalla de "Ajustes
   generales" (idioma de la interfaz, política de privacidad, acerca de,
   versión). El propio `docs/GOOGLE_PLAY_COMPLIANCE.md:48-51` marca esto
   como pendiente y necesario antes de publicar.
5. **Exportar / respaldar datos**: no hay forma de sacar copia de perfiles,
   tarjetas o rutinas del dispositivo. Desinstalar la app = pérdida total.
6. **Selector de idioma/voz** para TTS (hardcodeado a `es-ES` en
   `shared/constants/app.ts:20`).
7. **Contextos rápidos** (Casa/Escuela/Terapia) mencionados como pendientes
   en `docs/AAC_PRO_FASE2_PLAN.md:88-89`.
8. **Fotos/audio por paso de rutina** en Mi Día (solo texto + emoji).
9. Cualquier mecanismo de analítica de uso/progreso para terapeutas o
   familias (gráficos de uso, reportes) — no hay nada de esto en ninguna
   pantalla de Modo Adulto.

---

## 4. Funcionalidades parciales (PARCIAL)

1. **Sistema de categorías AAC**: 22 categorías reales existen, pero 10
   (Acciones, Escuela, Casa, Juego, Objetos, Animales, Ropa, Rutinas,
   Emergencia, Palabras sociales) se entregan **vacías** — sin ninguna
   tarjeta sembrada (`constants/seedCards.ts` no las cubre). Un niño que
   entra por primera vez a esas categorías ve una pantalla vacía con el
   mensaje genérico "Todavía no hay tarjetas en esta categoría."
2. **Pictogramas**: sin biblioteca curada de símbolos; se usa emoji Unicode
   de texto libre. Funciona, pero está por debajo del estándar de una app
   AAC profesional (ARASAAC, PCS, SymbolStix), donde la consistencia visual
   del símbolo importa para el aprendizaje del usuario.
3. **Calma 360**: la única herramienta real (frases rápidas) es funcional,
   pero el nombre y el enlace a "Mundo Sensorial" prometen una experiencia
   de autorregulación multimodal que no existe; hoy es un subconjunto
   renombrado del propio comunicador AAC.
4. **Modo Adulto**: fuerte en administración *por perfil* (tarjetas,
   ajustes AAC, rutinas), débil o inexistente en administración *global de
   la app* (ver §3, puntos 3-6).
5. **Accesibilidad de movimiento**: existe el toggle `reduceMotion` en el
   perfil (persiste correctamente) pero **no se lee en ningún componente de
   la app** — no hay animaciones que reducir hoy, así que el toggle no
   afecta nada visible (ver §5, es más bien un caso límite entre PARCIAL y
   SIMULADO).

---

## 5. Placeholders / funcionalidad simulada (SIMULADO / PLACEHOLDER)

1. **`ComingSoonScreen`** (`src/app/screens/ComingSoonScreen.tsx`): pantalla
   genérica reutilizada para "Juega & Regula" y "Mundo Sensorial". Es un
   placeholder explícito y transparente (dice "Esta sección estará
   disponible próximamente"), lo cual es honesto con el usuario, pero
   confirma que 1/3 de la Home no tiene producto detrás.
2. **Toggle "Reducir movimiento"** (`ProfileFormScreen.tsx:138-140`): se
   guarda y persiste, pero no hay ni un solo componente en la app que lea
   `reduceMotion` para cambiar su comportamiento (verificado por búsqueda
   global: 0 usos fuera de la definición/escritura del propio valor). Es
   una funcionalidad **simulada**: el adulto cree que está activando algo,
   y no pasa nada.
3. **Iconos y splash de la app**: `assets/icon.png`, `assets/splash-icon.png`
   y los iconos adaptativos de Android son, verificado visualmente, **el
   arte por defecto de la plantilla de Expo** (una "A" azul con guías de
   diseño / un blanco de círculos concéntricos), no una identidad visual de
   "Sense & Play Adventures 360". El `app.json` referencia estos archivos
   como si fueran definitivos.
4. **`AacCard.audioUri`**: campo de tipo reservado (`types.ts`) para audio
   grabado, nunca usado en ningún flujo — ni de escritura ni de lectura.

---

## 6. Problemas graves de UX/UI

1. **Un botón principal de Home no hace nada útil** ("Juega & Regula" →
   stub). Para un usuario/familia que instala la app esperando el producto
   completo, esto se siente roto, no "próximamente".
2. **Sin recuperación de PIN**: un adulto que olvida el PIN de 4 dígitos
   queda bloqueado permanentemente de Modo Adulto (no puede editar
   perfiles, tarjetas, ni rutinas) sin reinstalar la app y perder todos los
   datos. Esto es un defecto crítico de UX para el público objetivo
   (cuidadores, a menudo bajo estrés).
3. **Identidad visual ausente**: iconos de plantilla, sin logo, sin splash
   screen de marca, paleta de colores marcada explícitamente en el propio
   código como "provisional de Fase 1" (`shared/theme/colors.ts:1-6`). El
   producto se ve y se siente como un prototipo interno, no como una app
   lista para tiendas.
4. **Categorías vacías sin curación**: entrar a "Acciones", "Escuela",
   "Animales", etc. por primera vez muestra una pantalla vacía — mala
   primera impresión para categorías que deberían venir con vocabulario
   básico igual que las 12 originales.
5. **Duplicación conceptual**: Calma 360 y el vocabulario núcleo/tarjetas
   normales resuelven el mismo problema (frase corta que se habla al
   tocar) con dos implementaciones de UI ligeramente distintas
   (`QuickCommunication.tsx` vs. `AacCardTile.tsx`), sin diferenciación de
   propósito real más allá del texto de las frases.
6. **Sin onboarding**: la primera pantalla tras crear un perfil es
   directamente la Home con 3 botones; no hay ningún tutorial ni
   explicación para el adulto sobre qué es Modo Adulto, cómo cargar
   tarjetas, cómo configurar el tablero, etc.
7. **`AdultHomeScreen`** amontona 5 botones pequeños por fila
   (`rowActions`, `flexWrap: 'wrap'`) para cada perfil — en pantallas
   angostas esto puede degradar a botones apretados pese al estándar de
   64dp de toque que el propio proyecto se exige
   (`shared/theme/spacing.ts:23`); no se verificó en dispositivo dentro de
   esta auditoría (solo lectura de código), pero el layout es un riesgo.

---

## 7. Problemas de accesibilidad

1. **`reduceMotion` inerte** (ver §5) — declarado como principio de
   accesibilidad en `docs/ARCHITECTURE.md` pero sin implementación real.
2. **Sin soporte de tamaño de fuente dinámico del sistema**: los tamaños de
   texto (`shared/theme/typography.ts`) son fijos en puntos; no se
   respetan los ajustes de accesibilidad de tamaño de fuente del SO más
   allá del propio selector interno de "Tamaño del texto" en Ajustes de Mi
   Voz (que solo afecta las tarjetas AAC, no el resto de la app).
3. **Sin modo alto contraste** ni modo oscuro — la paleta es única y fija.
4. **Sin soporte de acceso por switch/escaneo**, común en necesidades
   motoras asociadas al público de una app AAC — todo el modelo de
   interacción asume toque directo.
5. **Diferenciación por color**: mitigada parcialmente (cada categoría
   también tiene emoji + texto, no solo color, según el comentario en
   `CategoryTile`/`categories.ts`), pero no se verificó contraste WCC AA
   real de la paleta (`colors.ts`) contra fondo `#FDF6EC`.
6. **PIN numérico sin alternativa**: no hay opción de biometría (huella/Face
   ID) para entrar a Modo Adulto, solo teclado numérico en pantalla.

---

## 8. Problemas de persistencia

1. **PIN de adulto en texto plano** (`services/storage/pinRepository.ts`):
   documentado a propósito como "barrera parental, no mecanismo
   criptográfico" — razonable para el modelo de amenaza (dispositivo
   familiar local), pero debe quedar explícito en cualquier documento de
   privacidad/Data Safety antes de publicar.
2. **Sin backup ni exportación**: todo vive únicamente en AsyncStorage del
   dispositivo. No hay export/import de perfiles, tarjetas ni rutinas.
   Desinstalar la app, cambiar de teléfono, o que el niño borre datos de la
   app en Ajustes de Android = pérdida total e irreversible.
3. **Sin versionado de esquema real**: las extensiones a `AacCard` y
   `ChildProfilePreferences` se resuelven con `?? valorPorDefecto` en
   tiempo de lectura (documentado en `docs/AAC_PRO_FASE2_PLAN.md:29-37`).
   Funciona hoy, pero es frágil a medida que crezca el número de campos
   opcionales — no hay una función de migración explícita ni un número de
   versión de esquema almacenado.
4. **Corrupción silenciosa**: `getItem` (`asyncStorage.ts:9-14`) atrapa
   `JSON.parse` inválido y devuelve `null` sin registrar ni alertar al
   usuario. Es más seguro que un crash, pero significa que datos corruptos
   desaparecen sin aviso (ej. todas las tarjetas de un perfil podrían
   "resembrar" desde cero sin que nadie note que se perdió lo editado).
5. **Fotos referenciadas por URI del sistema de archivos** (no copiadas al
   sandbox de la app de forma explícita verificada en este código): si el
   SO libera el archivo temporal de `expo-image-picker` o el usuario borra
   la foto original de la galería, la referencia (`imageUri`/`avatarUri`)
   puede romperse. No se encontró lógica de copia a almacenamiento
   permanente de la app.

---

## 9. Componentes que deben eliminarse o reescribirse

- **Ninguno debe eliminarse por estar mal construido** — el código existente
  (comunicador AAC, perfiles, rutinas, storage) es consistente, tipado y
  sigue un patrón repetible. El problema no es calidad de lo que existe,
  es alcance faltante.
- **`ComingSoonScreen`** debe eliminarse como **destino final** de
  producción (no como componente: puede conservarse como pantalla de
  fallback para features futuras aún no anunciadas), una vez que Mundo
  Sensorial tenga pantallas reales — hoy es el único punto de contacto de
  1/3 de la Home y no debería llegar a una tienda de aplicaciones en ese
  estado.
- **Toggle "Reducir movimiento"** en `ProfileFormScreen`: debe eliminarse
  de la UI hasta que exista una implementación real, o implementarse de
  inmediato — dejarlo como está (persistido pero inerte) es engañoso para
  el adulto que lo activa pensando que protege a su hijo/a de
  sobreestimulación.
- **Assets de icon/splash actuales**: deben reemplazarse antes de cualquier
  build de distribución; no son un problema de código sino de arte, pero
  bloquean la percepción de "app comercial".

## 10. Componentes que pueden conservarse

- `PhraseContext` / `PhraseBar` / `services/audio/speech.ts`: arquitectura
  de voz sólida (cola anti-solapamiento, aislamiento por perfil).
- `useAacCards` / `aacCardsRepository` y `useRoutines` /
  `routinesRepository`: patrón CRUD + persistencia + siembra consistente y
  reutilizable; buena base para extender a Mundo Sensorial (progreso de
  juegos) sin reinventar el patrón.
- `ProfilesContext` + `profileDataRegistry`: el mecanismo de registro de
  limpieza por perfil es un buen patrón de desacoplamiento entre features;
  vale la pena mantenerlo y usarlo para los datos que generen los futuros
  juegos sensoriales.
- `AacManagerScreen` / `AacCardFormScreen` / `AacSettingsScreen`: base
  administrativa de Modo Adulto reutilizable como plantilla para las
  pantallas de administración que falten (ajustes globales, gestión de
  PIN).
- Sistema de tema (`shared/theme/*`) y `BigButton`/`ScreenContainer`/
  `ProfileAvatar`: consistentes, accesibles en su forma (roles/labels), y
  ya declarados explícitamente como "paleta provisional" — listos para
  recibir la paleta definitiva sin refactor estructural.

---

## 11. Propuesta concreta para transformar el producto en una app comercial profesional

*(Propuesta para autorización futura — no implementar todavía, según
instrucción explícita del pedido.)*

1. **Cerrar la brecha más grande primero: Mundo Sensorial.** Es 1 de los 3
   pilares nombrados en el propio nombre "Sense & Play Adventures 360" y
   hoy no existe. Sin esto, ninguna cantidad de pulido en Mi Voz convierte
   al producto en lo que promete ser.
2. **Sembrar contenido en las 10 categorías AAC vacías** antes de
   considerar el comunicador "completo" — es esfuerzo de datos, no de
   arquitectura, y es rápido comparado con Mundo Sensorial.
3. **Reemplazar el toggle inerte de `reduceMotion`** por una implementación
   real (aunque sea mínima: desactivar transiciones de navegación) o
   quitarlo de la UI hasta que exista.
4. **Agregar recuperación de PIN** (ej. pregunta de seguridad, o "borrar
   solo el PIN" con confirmación fuerte que no toque perfiles/tarjetas).
5. **Construir la pantalla de Ajustes globales** que `docs/
   GOOGLE_PLAY_COMPLIANCE.md` ya identifica como bloqueante: política de
   privacidad, acerca de, versión, y idea de exportación/backup local
   (aunque sea a un archivo compartible, no necesariamente a la nube, para
   mantener el principio offline-first).
6. **Encargar identidad visual real** (icono, splash, paleta definitiva —
   la Fase 10 "Diseño definitivo" del propio roadmap): reemplaza
   directamente los assets de plantilla de Expo detectados en esta
   auditoría.
7. **Evaluar biblioteca de pictogramas** (ARASAAC es de licencia abierta y
   común en apps AAC) como alternativa/complemento al emoji libre, al
   menos para el vocabulario núcleo y las categorías sembradas.
8. **Pruebas de accesibilidad reales** (Fase 11 del roadmap): lector de
   pantalla, contraste, tamaño de fuente dinámico del sistema — hoy es
   una declaración de principios en `ARCHITECTURE.md`, no una verificación.
9. **Diferenciar Calma 360 de Mi Voz** con al menos una herramienta no
   basada en tarjetas (ej. respiración guiada con animación/temporizador,
   ya que es el minijuego "Respira conmigo" planeado para Mundo Sensorial:
   podría construirse una vez y reutilizarse en ambos lugares).
10. Solo después de 1-9: build, ajuste de `versionCode`/EAS y checklist de
    Play Console — en ese orden, no antes.

---

## 12. Prioridades

### P0 — Bloqueante para llamar al producto "completo"
- Mundo Sensorial / Juega & Regula: al menos los 6 minijuegos planeados, o
  redefinir el alcance del producto si se decide recortar el pilar.
- Recuperación de PIN de adulto.
- Reemplazo de iconos/splash de plantilla por identidad de marca real.
- Sembrar vocabulario en las 10 categorías AAC vacías.
- Eliminar o implementar de verdad el toggle "Reducir movimiento".

### P1 — Necesario para una publicación seria en tienda
- Pantalla de Ajustes globales (privacidad, acerca de, versión).
- Exportar/respaldar datos locales.
- Diferenciar Calma 360 de una herramienta real de autorregulación (no solo
  frases).
- Selector de idioma/voz de TTS (aunque sea es-ES/es-LA/en-US para
  empezar).
- Pruebas de accesibilidad reales (lector de pantalla, contraste, fuente
  dinámica).

### P2 — Mejoras de producto, no bloqueantes
- Biblioteca de pictogramas curada en vez de emoji libre.
- Contextos rápidos (Casa/Escuela/Terapia).
- Fotos/audio por paso de rutina en Mi Día.
- Grabaciones de voz familiar en tarjetas AAC.
- Analítica/reportes de uso para cuidadores o terapeutas.
- Biometría como alternativa al PIN.

---

## Porcentaje estimado de cumplimiento funcional real

**≈ 45–50% del producto descrito en el pedido de auditoría está realmente
funcional hoy.**

Justificación por área (peso relativo aproximado dentro del producto total,
según los 3 pilares nombrados en el propio nombre de la app + Modo Adulto +
Home):

| Área | Peso aprox. | Cumplimiento real | Nota |
| --- | --- | --- | --- |
| Mi Voz AAC | 35% | **~80%** | Núcleo sólido y realmente funcional (frases, TTS, CRUD, búsqueda, favoritos/recientes/más usados, persistencia por perfil). Pierde puntos por: 10/22 categorías vacías, pictogramas sin biblioteca curada, sin grabación de voz familiar. |
| Mundo Sensorial | 25% | **0%** | No existe ningún código de producto; solo un `README.md` de planificación. |
| Calma 360 | 10% | **~35%** | Una herramienta real (frases rápidas) pero sin diversidad de recursos de autorregulación; el enlace central de la pantalla ("Ir a Mundo Sensorial") es un placeholder. |
| Modo Adulto | 15% | **~55%** | Fuerte en administración por perfil (tarjetas, ajustes AAC, rutinas); sin ajustes globales, sin recuperación de PIN, sin backup. |
| Home / Navegación / Identidad de producto | 15% | **~40%** | Navegación técnica correcta, pero 1 de 3 botones principales es un placeholder y la identidad visual completa (iconos, splash, paleta) es la de la plantilla de Expo sin personalizar — se percibe como prototipo, no como app comercial lista para tienda. |

**Cálculo ponderado:** `0.35×80 + 0.25×0 + 0.10×35 + 0.15×55 + 0.15×40 ≈
28 + 0 + 3.5 + 8.25 + 6 = 45.75%` → **≈ 46%**.

Esto coincide con la percepción reportada tras probar la app en dispositivo
físico: lo que funciona (Mi Voz, Mi Día, administración por perfil) funciona
de verdad y con buena arquitectura debajo; pero el producto anunciado como
"Sense & Play Adventures 360" — comunicación **y juego sensorial** — todavía
no incluye la mitad de su propuesta de valor (el juego sensorial), y lo que
sí está construido aún no tiene la terminación visual ni los flujos de
soporte (recuperación de PIN, ajustes globales, backup) que se esperan de
una aplicación comercial publicada en una tienda de apps.

---

**Fin de la auditoría. No se realizaron cambios de código, build ni
configuración como parte de este documento, según lo solicitado.**
