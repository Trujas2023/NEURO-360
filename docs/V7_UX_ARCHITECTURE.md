# Arquitectura UX/UI — Sense & Play Adventures 360 V7 (Fase 7B)

**Estado:** solo especificación. Esta fase **no escribe código de la app**
(no hay commits de `src/`, `app.json` ni configuración). Es el puente entre
la auditoría de solo lectura (`docs/V7_PRODUCT_AUDIT.md`, Fase 7A) y el
trabajo de implementación de 7C en adelante. No toca `android.package`,
`ios.bundleIdentifier`, `versionCode` ni configuración EAS.

**Insumo:** `docs/V7_PRODUCT_AUDIT.md` (Fase 7A, aprobada). Todo lo que
sigue asume esos hallazgos como ciertos y no los repite en detalle — remite
a la sección correspondiente cuando hace falta justificar una decisión.

---

## 1. Alcance de 7B

Definir, antes de tocar una sola línea de código:

1. Un veredicto explícito por cada una de las 34 pantallas (§3), aplicando
   la rúbrica de la Regla 3: claridad + utilidad + accesibilidad +
   facilidad de uso + consistencia visual.
2. El árbol de navegación final (§4), resolviendo la inconsistencia
   Sensorial/Jugar señalada en la auditoría (§6.6 de 7A).
3. La especificación funcional (no visual — eso es 7C) de cada pantalla
   nueva o reestructurada: Home, Welcome, Centro Adulto y sus 3 secciones
   nuevas (Estadísticas, Accesibilidad, Respaldo), y el componente de
   grilla compartido.
4. Los puntos de entrada de las funciones que 7F/7G todavía van a
   construir (Sonidos y ritmo, Acuario interactivo, Necesito un descanso),
   para que su lugar en la navegación quede decidido ahora y no se
   improvise cuando llegue el turno de construirlas.
5. Reglas UX transversales que 7C debe respetar como restricciones, no
   como sugerencias (objetivo táctil, accesibilidad, tablet).
6. Trazabilidad explícita: qué construye cada fase de 7C a 7K, para que
   nadie tenga que releer todo el documento en cada fase.

Lo que **no** hace 7B: elegir colores, tipografía, iconos concretos ni
escribir código. Eso es 7C (Design System) y 7D en adelante
(implementación).

---

## 2. Rúbrica de evaluación

Aplicada a cada pantalla en §3, con la misma vara para las 34:

| Criterio | Pregunta que responde |
|---|---|
| **Claridad** | ¿Un niño o un adulto entiende qué pantalla es y qué puede hacer sin explicación previa? |
| **Utilidad** | ¿Cumple una necesidad real del producto, o es redundante con otra pantalla? |
| **Accesibilidad** | ¿Objetivo táctil ≥48dp, `accessibilityLabel`/`Role` presentes, contraste suficiente, respeta `reduceMotion`/`soundEnabled` donde aplica? |
| **Facilidad de uso** | ¿Cuántos toques/decisiones exige llegar al resultado? ¿Hay pasos redundantes? |
| **Consistencia visual** | ¿Comparte patrón (grilla, tarjeta, botón) con el resto de la app, o inventa su propio layout? |

Veredictos posibles (columna "Decisión" de §3):

- **Mantener** — pasa la rúbrica; en 7C solo recibe el nuevo Design System
  (colores/tipografía/iconos), sin cambios de estructura ni de código de
  layout.
- **Reestructurar** — la función es correcta pero su lugar en la
  navegación, su densidad de controles o su layout necesita cambiar antes
  de que valga la pena restylearla.
- **Ampliar** — se mantiene, pero gana contenido nuevo en una fase
  posterior (una tarjeta más en una grilla, un flujo nuevo colgando de
  ella).
- **Eliminar** — no cumple ningún propósito real hoy.

---

## 3. Evaluación pantalla por pantalla

| # | Pantalla | Decisión | Motivo (rúbrica) | Fase que actúa |
|---|---|---|---|---|
| 1 | `WelcomeScreen` | Reestructurar | Consistencia visual: única pantalla sin ningún elemento de marca real, solo emoji (§1/§9 de 7A). Claridad/utilidad OK. | 7C (contenido nuevo) + 7D (layout) |
| 2 | `ProfileSelectorScreen` | Mantener | Cumple los 5 criterios; grilla de perfiles clara y accesible. | 7C (restyle) |
| 3 | `ProfileFormScreen` | Mantener | Formulario funcional y accesible. | 7C (restyle) |
| 4 | `HomeScreen` | Reestructurar | Facilidad de uso: jerarquía inconsistente Calma/Mi Día (tabs) vs. Sensorial/Jugar (solo botón de Home) — §6.6 de 7A. | 7D |
| 5 | `ComingSoonScreen` | **Eliminar** | Utilidad: cero, ruta huérfana (§7.1 de 7A). | 7D |
| 6 | `AacHomeScreen` | Mantener | 4 niveles adaptativos ya resuelven complejidad progresiva; los 5 criterios se cumplen. | 7C (restyle) |
| 7 | `AacCategoryScreen` | Mantener | Consistente con `AacHomeScreen`. | 7C (restyle) |
| 8 | `AacManagerScreen` | Reestructurar | Accesibilidad: botón de 40dp bajo el piso de 48dp (§6.4 de 7A). Facilidad de uso: fila de 5 acciones por tarjeta, densa (§6.9). | 7C+7E |
| 9 | `AacCardFormScreen` | Mantener | Formulario largo pero claro, ya incluye grabación de voz completa. | 7C (restyle) |
| 10 | `AacSettingsScreen` | Mantener | Ajustes agrupados con sentido. | 7C (restyle) |
| 11 | `CalmCommunicationScreen` | Ampliar | Falta el punto de entrada a "Necesito un descanso" (§4 de 7A). | 7G |
| 12 | `PainFlowScreen` | Mantener | Flujo guiado claro (silueta → zona → intensidad → cualidad). | 7C (restyle) |
| 13 | `OverwhelmFlowScreen` | Mantener | Mismo patrón que `PainFlowScreen`, consistente. | 7C (restyle) |
| 14 | `SensoryHomeScreen` | Ampliar | Grilla de necesidades correcta; gana 2 tarjetas nuevas (Sonidos y ritmo, Acuario). | 7F |
| 15 | `BubblesScreen` | Mantener | Actividad completa y accesible. | 7C (restyle) |
| 16 | `BreathingScreen` | Mantener | Ídem. | 7C (restyle) |
| 17 | `VisualTrackingScreen` | Mantener | Ídem. | 7C (restyle) |
| 18 | `SensoryPaintScreen` | Mantener | Ídem, incluye 4 modos de trazo. | 7C (restyle) |
| 19 | `CauseEffectScreen` | Mantener | Ídem. | 7C (restyle) |
| 20 | `SensorySettingsScreen` | Reestructurar | Pasa a vivir dentro de Centro Adulto en vez de colgar directo de `AdultHomeScreen`. | 7D |
| 21 | `GamesHomeScreen` | Mantener | Selector de 6 juegos claro, mismo patrón de grilla. | 7C (restyle) |
| 22-27 | Los 6 juegos (`ColorMatch`, `ShapeMatch`, `Emotions`, `CategorySort`, `Memory`, `Sequence`) | Mantener | Motor compartido (`ChoiceGame`/`GameFrame`) ya consistente, sin puntuación punitiva. | 7C (restyle) |
| 28 | `GamesSettingsScreen` | Reestructurar | Pasa a Centro Adulto (igual que #20). | 7D |
| 29 | `MyDayScreen` | Mantener | 3 modos de presentación ya resuelven distintos niveles de apoyo visual. | 7C (restyle) |
| 30 | `RoutineManagerScreen` | Mantener | CRUD claro. | 7C (restyle) |
| 31 | `RoutineFormScreen` | Mantener | Formulario largo pero ordenado por secciones. | 7C (restyle) |
| 32 | `HelpScreen` | Mantener | Acceso de emergencia, ya a 1 toque global. | 7C (restyle) |
| 33 | `PinGateScreen` | Mantener | Flujo de PIN claro en sus 3 etapas. | 7C (restyle) |
| 34 | `AdultHomeScreen` | **Reestructurar → reemplazar** | Utilidad/facilidad de uso: 7 botones por fila por perfil, sin secciones (§4.8/§9 de 7A). Se reemplaza por `AdultCenterScreen` (§7). | 7D |

**Resumen:** 24 pantallas se mantienen tal cual a nivel de estructura (solo
reciben el Design System en 7C), 6 se reestructuran, 3 se amplían con
contenido nuevo en fases posteriores, 1 se elimina. Confirma el diagnóstico
de 7A: la mayoría del trabajo de V7 es de superficie (visual) y de
organización (Centro Adulto), no de reconstrucción funcional.

---

## 4. Árbol de navegación final

Formaliza la propuesta de §11 de 7A, con nombres de ruta concretos para que
7D pueda implementarlo directamente.

```
Welcome
  → ProfileSelector ⇄ ProfileForm
  → PinGate → AdultCenter (nuevo, reemplaza AdultHome)

AdultCenter (nuevo)
  → ProfileForm (alta perfil), y por perfil seleccionado:
  → AacManager, AacSettings          (Mi Voz)
  → SensorySettings                   (Mundo Sensorial)
  → GamesSettings                     (Juega & Regula)
  → RoutineManager                    (Mi Día)
  → Accessibility (nuevo)             (transversal, no por perfil)
  → Statistics (nuevo)                (por perfil)
  → Backup (nuevo)                    (global, no por perfil)

MainTabs (Modo Niño, barra inferior — sin cambios de fondo)
  Inicio → HomeScreen
    → MiVoz, Calma, Sensorial, Jugar, Mi Día, Ayuda
      (los 4 sistemas con la MISMA jerarquía visual en la grilla de Home;
      Sensorial y Jugar dejan de leerse como "secundarios" frente a
      Calma/Mi Día — resuelve §6.6 de 7A. Ninguno de los dos pasa a ser
      tab: 6 tabs en una barra de niño sería exceso de carga cognitiva,
      así que la corrección es de jerarquía visual en Home, no de agregar
      tabs.)
  Mi Voz → AacNavigator (AacHome ⇄ AacCategory) — sin cambios
  Calma → CalmCommunicationScreen
    → PainFlow, OverwhelmFlow, Rest (nuevo, "Necesito un descanso"),
      SensoryHome
  Mi Día → MyDayScreen — sin cambios

Fuera de tabs (alcanzables en 1-2 toques desde Home o Calma)
  SensoryHome → Bubbles, Breathing, Tracking, Paint, CauseEffect,
                SoundRhythm (nuevo), Aquarium (nuevo)
  GamesHome → los 6 juegos — sin cambios
  Help → frases de auxilio — sin cambios
```

`ComingSoon` no aparece: se elimina de `RootStackParamList` en 7D.

---

## 5. Especificación: `HomeScreen`

**Problema a resolver:** hoy "Calma" y "Mi Día" son tabs *y* botones en
Home; "Sensorial" y "Jugar" son solo botones en Home. Un niño que mira la
grilla de Home no tiene forma de saber por qué dos de los cuatro sistemas
"desaparecen" de la pantalla al cambiar de tab y los otros dos no.

**Decisión de 7B:** los 4 sistemas se presentan en Home con el **mismo
tratamiento visual** (mismo tamaño de tarjeta, misma jerarquía), sin
importar si además tienen tab propio. El botón "Quiero comunicarme"
(acceso directo a Mi Voz) se mantiene como acción primaria porque
comunicación es la función más usada y de mayor urgencia — decisión de
producto ya validada, no un problema de la auditoría.

**Estructura de contenido** (sin definir aún estilos, eso es 7C):
1. Saludo + avatar del perfil activo (sin cambios).
2. Acción primaria: "Quiero comunicarme" → Mi Voz (sin cambios).
3. Grilla única de 4 tarjetas del mismo tamaño: Calma, Sensorial, Jugar,
   Mi Día (hoy son 2 filas de 2 con tratamiento distinto entre la primera
   y la segunda — pasan a ser una sola grilla de 4 con trato idéntico).
4. Ayuda (acción de emergencia, se mantiene visualmente distinta a
   propósito — es la única acción que debe destacar por urgencia, no por
   frecuencia de uso).
5. Cambiar perfil (pie, sin cambios).

**Fuera de alcance de 7B:** el componente `EntityGridCard` que va a
renderizar estas 4 tarjetas se especifica en §11; su implementación visual
es 7C, su cableado en `HomeScreen` es 7D.

---

## 6. Especificación: `WelcomeScreen`

**Problema a resolver:** primera impresión de la app sin ningún elemento
de marca (§9 de 7A).

**Decisión de 7B:** mantiene su función (splash de bienvenida → "Comenzar"
→ `ProfileSelector`), pero deja de depender de un solo emoji como
identidad visual. Contenido a definir en 7C: una marca/ilustración real
(no necesariamente un ícono nuevo — puede ser tan simple como una
composición tipográfica del nombre de la app bien resuelta, a decidir en
7C con el Design System ya elegido). 7B no prescribe el asset final, solo
establece que "un emoji solo" deja de ser aceptable como resultado de 7C.

---

## 7. Especificación: `AdultCenterScreen` (nuevo, reemplaza `AdultHomeScreen`)

**Problema a resolver:** hoy la administración de cada perfil son 7
botones en una fila que se envuelve (§4.8/§9 de 7A). No hay forma de ver
"todo lo de accesibilidad" o "todo lo de sonido" en un solo lugar sin
pasar antes por un perfil concreto.

**Decisión de 7B — estructura de dos niveles:**

**Nivel 1 — Landing de Centro Adulto** (nueva pantalla, ruta `AdultCenter`,
reemplaza a `AdultHome` en el stack):
- Selector de perfil activo para las secciones que son *por perfil*
  (mismo patrón que hoy, pero como selector explícito arriba de la
  pantalla, no repetido en cada fila).
- Secciones como tarjetas de navegación (mismo componente
  `EntityGridCard` de §11, reutilizado también aquí):
  1. **Perfiles** — alta/edición/eliminación (lo que hoy hace la lista de
     `AdultHomeScreen` en sí).
  2. **Mi Voz** → `AacManager` + `AacSettings` (agrupados bajo una
     sub-selección, no dos tarjetas sueltas).
  3. **Mundo Sensorial** → `SensorySettings`.
  4. **Juega & Regula** → `GamesSettings`.
  5. **Mi Día** → `RoutineManager`.
  6. **Accesibilidad** (nueva, §8) — transversal, no depende de perfil
     seleccionado.
  7. **Estadísticas** (nueva, §9) — por perfil.
  8. **Respaldo** (nueva, §10) — global.
- "Salir de Modo Adulto" se mantiene, mismo lugar de siempre (pie de
  pantalla).

**Nivel 2 — pantallas de ajuste existentes**: `AacManager`, `AacSettings`,
`SensorySettings`, `GamesSettings`, `RoutineManager` **no cambian de
contenido**, solo de padre en la navegación (antes colgaban directo de
`AdultHome`, ahora cuelgan de `AdultCenter`). Ninguna se reescribe en esta
fase ni en 7D — su rediseño visual, si aplica, es 7C como el resto.

**Por qué "Sonido/Voz" no es una sección separada:** la configuración de
voz (velocidad/tono TTS, grabación) ya vive dentro de `AacSettings` y
`AacCardFormScreen`, coherente con que es una función de Mi Voz, no
transversal. Se decide **no** duplicarla como sección propia del Centro
Adulto — evita que la misma configuración exista en dos lugares con riesgo
de desincronizarse.

---

## 8. Especificación: Accesibilidad (nueva sección)

**Problema a resolver:** hoy `reduceMotion`, tamaño de texto y qué mostrar
en tarjeta viven repartidos en `AacSettingsScreen`/`ProfileFormScreen`, sin
un lugar único (§4/§6 de 7A).

**Decisión de 7B:** la sección **no introduce preferencias nuevas** en
7B — reorganiza el *acceso* a las que ya existen (`reduceMotion`,
`textSize`, `showCardText`/`showCardImage`/`showCardColor`) más un control
transversal nuevo:
- **Reducir movimiento** — hoy solo se lee en Sensorial y Mi Día; pasa a
  ser una preferencia global (`ChildProfilePreferences.reduceMotion`, que
  ya existe) y su lectura se extiende a cualquier animación que 7C agregue
  en otros módulos (juegos, transiciones de pantalla).
- **Tamaño de texto** (ya existe como `AacTextSize`, hoy solo afecta
  tarjetas AAC) — se documenta como candidato a volverse global en 7J si
  el Design System de 7C lo permite sin romper layouts; 7B no lo decide
  todavía porque depende de decisiones tipográficas que aún no existen.
- **Qué mostrar en tarjeta** (`showCardText`/`showCardImage`/
  `showCardColor`, ya existen, hoy en `AacSettingsScreen`) — se **enlazan**
  desde la nueva sección de Accesibilidad en vez de duplicarse; siguen
  siendo del dominio de Mi Voz, pero un adulto que busca "accesibilidad"
  primero también los encuentra ahí.

Construcción real (código): 7H, según el plan de 7A.

---

## 9. Especificación: Estadísticas (nueva sección, por perfil)

**Problema a resolver:** cero visibilidad hoy sobre uso real (§4 de 7A).

**Decisión de 7B — qué datos mostrar**, todos derivables de datos que
**ya existen** en storage, sin modelo nuevo:
- Tarjetas AAC más usadas (`usageCount`, ya se acumula, hoy sin vista).
- Última vez que se usó cada tarjeta (`lastUsedAt`, ídem).
- Rutinas de Mi Día completadas (requiere agregar un contador — hoy
  `DailyRoutine`/`RoutineStep` no registran completados históricos, solo
  el estado `done` actual que se resetea con "Reiniciar rutina"; **esto sí
  es un campo nuevo**, a definir en 7H/7I, no en 7B).
- Juegos jugados (mismo caso: no hay ningún registro histórico hoy, campo
  nuevo pendiente de 7H/7I).

**Decisión explícita de 7B:** Estadísticas se limita a **datos ya
capturados** en su primera versión (más usados/recientes de Mi Voz);
rutinas y juegos completados quedan marcados como "requiere campo nuevo en
7I" para no bloquear 7H con una decisión de modelo de datos que todavía no
se tomó. Es preferible una sección más chica que funcione de verdad a una
completa con datos inventados — coherente con la Regla 6 del brief.

Construcción real: 7H (vista de más usados/recientes) + 7I (si se decide
agregar contadores históricos de rutinas/juegos).

---

## 10. Especificación: Respaldo (nueva sección, global)

**Problema a resolver:** sin forma de exportar/respaldar datos fuera del
dispositivo (§4 de 7A).

**Decisión de 7B — alcance mínimo viable, consistente con "todo local"**:
- **Exportar**: vuelca perfiles + tarjetas AAC + rutinas + ajustes (todo lo
  que ya está en AsyncStorage) a un único archivo JSON, que el adulto
  guarda donde quiera con el selector nativo de "compartir/guardar
  archivo" de Android — **no sube nada a ningún servidor**, coherente con
  la política de privacidad ya aplicada en toda la app.
- **Importar**: lee ese mismo archivo y restaura el estado. Debe advertir
  explícitamente que reemplaza los datos actuales del dispositivo antes de
  aplicar nada (irreversible sin otro respaldo).
- **Explícitamente fuera de alcance de V7**: no incluye los archivos de
  audio de las grabaciones de voz en el primer respaldo (son binarios más
  pesados que JSON; incluirlos es una decisión de 7I con su propio
  análisis de tamaño/rendimiento, no una que 7B pueda tomar a ciegas).

Construcción real: 7H (UI) + 7I (decide si el respaldo requiere
`storageVersion` para ser compatible entre versiones futuras de la app).

---

## 11. Especificación: `EntityGridCard` (componente compartido)

**Problema a resolver:** 4 pantallas reimplementan la misma tarjeta de
grilla con estilos casi idénticos (§7.7 de 7A: `SensoryHomeScreen`,
`GamesHomeScreen`, `MyDayScreen`, y el patrón de categorías de
`AacHomeScreen`).

**Contrato del componente** (props, no estilos — los estilos son 7C):

```ts
interface EntityGridCardProps {
  emoji: string;          // o icono, según lo que decida 7C
  label: string;
  description?: string;   // usado hoy solo por GamesHomeScreen
  accentColor: string;    // borde/acento por entidad (rutina, juego, necesidad...)
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  badge?: string;         // ej. "3/5 pasos hechos" de MyDayScreen
}
```

Reemplaza el layout `card`/`emoji`/`label` repetido en las 4 pantallas
listadas. También es el componente que usa la nueva grilla de Home (§5) y
la landing de Centro Adulto (§7) para sus tarjetas de sección — un solo
componente, cuatro contextos de uso.

Construcción real: 7C (implementación visual) + 7D/7E/7F (adopción en cada
pantalla, sin cambiar su lógica).

---

## 12. Puntos de entrada de funciones aún no construidas

Para que 7F/7G no tengan que decidir "dónde vive esto" además de
construirlo:

- **Sonidos y ritmo** → nueva `EntityGridCard` en `SensoryHomeScreen`,
  mismo patrón que las 5 actividades existentes, ruta `SensorySoundRhythm`.
- **Acuario interactivo** → ídem, ruta `SensoryAquarium`.
- **Necesito un descanso** → botón dedicado en `CalmCommunicationScreen`
  (no dentro de un flujo guiado como Dolor/Saturación — es una acción
  directa de un toque, coherente con que un descanso no necesita un árbol
  de decisión), ruta `CalmRest`, con su propio temporizador visual
  (reutilizando el patrón de `VisualTimer` que ya existe en
  `daily-routine`, adaptado — no reconstruido desde cero).

---

## 13. Reglas UX transversales (restricciones para 7C en adelante)

1. **Objetivo táctil mínimo 48dp en el 100% de los controles**, sin
   excepción — corrige el hallazgo de §6.4 de 7A (`AacManagerScreen`
   `iconButton` en 40dp) y evita que se repita en componentes nuevos.
2. **`accessibilityLabel`/`accessibilityRole` obligatorios** en todo
   elemento interactivo nuevo o reestructurado — no se acepta la cobertura
   parcial actual (59%) como estándar para código nuevo; la pasada de
   cobertura completa del código existente es 7J, pero nada nuevo de 7C en
   adelante debe agregar más deuda.
3. **`reduceMotion` y `soundEnabled` se respetan en cualquier pantalla que
   agregue animación o audio**, sin excepción — hoy Sensorial y Mi Día lo
   hacen, Juegos no lo necesita (no tiene animaciones), pero cualquier
   animación nueva (transiciones de Centro Adulto, celebraciones de
   Estadísticas) debe leerlos desde el primer commit que la introduce.
4. **Orientación y tablets**: se **mantiene** `orientation: portrait` en
   V7 (no se abre soporte landscape) — es un cambio de alcance mayor
   (afecta cada layout de la app) que el brief V7 no pide explícitamente y
   que 7A solo señaló como "no adaptado", no como requisito a resolver.
   Lo que sí se exige a partir de 7C: los layouts nuevos (`EntityGridCard`,
   grillas, Centro Adulto) deben escalar por ancho de pantalla igual que
   `cardWidthForBoardSize` ya hace hoy para tarjetas AAC, para que una
   tablet en portrait aproveche el ancho extra con más columnas en vez de
   tarjetas estiradas o espacio vacío. **Esta decisión queda sujeta a tu
   autorización de 7B** — si prefieres abrir soporte landscape, es un
   cambio de alcance que conviene decidir ahora, no a mitad de 7D.
5. **Sin nuevas dependencias de red ni telemetría** — Estadísticas y
   Respaldo (§9, §10) son 100% locales, coherente con el resto de la app;
   ninguna fase de V7 introduce analítica externa.

---

## 14. Trazabilidad — qué construye cada fase

| Fase | Construye de este documento |
|---|---|
| 7C | Design System (tokens visuales) + implementación de `EntityGridCard` (§11) + restyle de las 24 pantallas "Mantener" (§3) |
| 7D | `AdultCenterScreen` (§7, nivel 1) + `HomeScreen` reestructurado (§5) + `WelcomeScreen` con marca real (§6) + elimina `ComingSoon` + árbol de navegación final (§4) |
| 7E | Adopta `EntityGridCard` en pantallas de Mi Voz si aplica; reestructura `AacManagerScreen` (fila de acciones + objetivo táctil, §3 fila 8) |
| 7F | Sonidos y ritmo + Acuario interactivo (§12), con licencias de audio verificadas |
| 7G | Necesito un descanso (§12) + sonidos relajantes propios de Calma |
| 7H | Accesibilidad (§8) + Estadísticas v1 (§9) + Respaldo (§10), UI |
| 7I | Decide `storageVersion`/interfaces de repositorio si Estadísticas históricas o Respaldo con audio lo requieren |
| 7J | Cobertura de accesibilidad al 100%, QA en dispositivo real (teléfono + tablet) |
| 7K | Verificación final, `versionCode`, build |

---

## 15. Fuera de alcance de 7B (explícito)

- Ningún color, tipografía ni ícono concreto (7C).
- Ningún cambio de código en `src/`, `app.json` ni navegación real (7D en
  adelante).
- No se construye ningún audio, actividad ni pantalla nueva todavía (7F,
  7G, 7H).
- No se decide `storageVersion` ni interfaces de repositorio (7I).

---

## Cierre de Fase 7B

Documento de especificación únicamente. No se modificó ningún archivo de
`src/`, `app.json` ni configuración. Queda un punto abierto que requiere tu
confirmación explícita antes de 7D: **la decisión de §13.4 (mantener
portrait-only, sin soporte landscape en V7)** — si la apruebas tal cual,
7D la implementa sin más preguntas; si prefieres abrir landscape/tablet,
avísamelo ahora para no rehacer trabajo de 7D en fases posteriores.

Detenido aquí, a la espera de tu autorización para iniciar la Fase 7C.
