# Mundo Sensorial — actividades completas (Fase 7F)

**Estado:** cuarta fase de V7 con código real. Alcance exacto asignado a
7F por `docs/V7_UX_ARCHITECTURE.md` §12: "Sonidos y ritmo" y "Acuario
interactivo", **con licencias de audio verificadas antes de escribir
código** — condición explícita del plan de 7B, y restricción del usuario
desde la fase de voz ("NO agregues audios sin licencia"). No toca
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS.

---

## 1. La pregunta de licencia, resuelta antes de escribir código

Mundo Sensorial ya documentaba (`types.ts`, `README.md`) que "sonidos
ambientales" (lluvia, mar, viento, bosque, ruido blanco, agua — la 6ª
actividad del roadmap original) **no podía construirse** porque
requeriría grabaciones reales con licencia y `assets/sounds/` estaba
vacío. Ese bloqueo sigue vigente y **no se tocó en esta fase**.

Pero el brief V7 pide "Sonidos y ritmo", no literalmente "sonidos
ambientales" — son requisitos distintos. La resolución: en vez de
sonidos *grabados* (que sí necesitarían licencia de un tercero), la
actividad usa **tonos sintetizados por código**: 6 ondas sinusoidales con
armónicos suaves y una envolvente tipo campana, generadas con un script
de Python de un solo uso (`wave`/`struct` de la librería estándar, sin
dependencias nuevas), exportadas como WAV de 44.1kHz/16-bit a
`assets/sounds/tone_c4.wav` … `tone_c5.wav` (escala pentatónica de Do:
Do-Re-Mi-Sol-La-Do agudo — suena bien en cualquier orden, no hay forma de
tocar una combinación "que no encaje").

**No hay ninguna licencia que verificar** porque no hay ninguna obra de
un tercero involucrada: son formas de onda matemáticas generadas para
este proyecto, igual que cualquier otro código del repositorio. Esto no
es una forma de esquivar la regla de "no audios sin licencia" — es
exactamente lo que esa regla permite: crear contenido propio en vez de
usar contenido ajeno sin autorización.

"Acuario interactivo" no necesitó esta pregunta en absoluto: es una
actividad puramente visual/táctil, sin ningún audio.

---

## 2. "Sonidos y ritmo" (`SensorySoundRhythmScreen`)

6 pastillas de color (misma paleta que el resto de Mundo Sensorial,
`SENSORY_PALETTE`), cada una asociada a una nota. Tocar una pastilla:
reproduce su tono, vibra suave (respeta "Vibración suave" del perfil), y
pulsa visualmente (`Animated`, más lento con "Reducir movimiento").
**Los tonos pueden sonar superpuestos a propósito** — un servicio nuevo,
`services/audio/tonePlayback.ts`, crea un reproductor efímero por toque y
se autolimpia después de sonar, a diferencia de `recordingPlayback.ts`
(voz) que sí corta la reproducción anterior. Tocar varias notas seguidas
debe sonar como un instrumento, no interrumpirse como una grabación de
voz — son necesidades de producto opuestas, de ahí el servicio separado
en vez de reusar el existente.

Sin secuencia que memorizar, sin puntaje, sin orden "correcto" — es un
instrumento simple de exploración libre, no un juego de memoria (eso ya
existe en Juega & Regula).

---

## 3. "Acuario interactivo" (`SensoryAquariumScreen`)

Tocar en cualquier parte de la pantalla hace aparecer un pez (forma
SVG simple, `react-native-svg`, ya usado en Pintura sensorial) que nada
de un borde al otro con un leve balanceo vertical y desaparece al llegar.
Sin nada que "alimentar" de verdad, sin objetivo ni final — mismo
principio que el resto de Mundo Sensorial (regulación, no un juego que se
gana o se pierde). Tope de 10 peces en pantalla a la vez (mismo patrón
que `CauseEffectScreen` usa para sus formas). Vibración suave al tocar;
sin audio.

---

## 4. Integración

- `SensoryActivityId` (`types.ts`) gana `'soundRhythm'` y `'aquarium'`;
  el comentario que documentaba el bloqueo de licencia se actualiza para
  explicar por qué estas dos sí pudieron construirse.
- `SENSORY_NEEDS` (`data/activities.ts`) gana 2 entradas: "Escuchar" 🎵 y
  "Explorar" 🐠.
- `SensoryHomeScreen` pasa a usar `EntityGridCard` (Fase 7C, sin adoptar
  hasta ahora) para las 7 tarjetas — cierra uno de los 4 patrones de
  grilla casi idénticos que `docs/V7_PRODUCT_AUDIT.md` §7.7 señaló, ya
  que hacía falta tocar este archivo de todos modos para las 2
  actividades nuevas.
- Rutas nuevas (`SensorySoundRhythm`, `SensoryAquarium`) en
  `RootStackParamList` y `RootNavigator`.
- `docs/QA_ANDROID_INTERNAL_TESTING.md` §13 actualizado: pruebas reales
  para ambas actividades nuevas, y una aclaración explícita de que
  "Sonidos y ritmo" (nuevo, tonos propios) y "sonidos ambientales"
  (todavía sin construir, necesitaría licencia real) son cosas distintas
  — para que nadie las confunda al hacer QA.
- `README.md` del módulo actualizado con la misma aclaración.

---

## 5. Archivos modificados/creados

**Nuevos:** `assets/sounds/tone_c4.wav`, `tone_d4.wav`, `tone_e4.wav`,
`tone_g4.wav`, `tone_a4.wav`, `tone_c5.wav` (748 KB en total),
`src/services/audio/tonePlayback.ts`,
`src/features/sensory-world/screens/SensorySoundRhythmScreen.tsx`,
`src/features/sensory-world/screens/SensoryAquariumScreen.tsx`.

**Modificados:** `src/features/sensory-world/types.ts`,
`src/features/sensory-world/data/activities.ts`,
`src/features/sensory-world/screens/SensoryHomeScreen.tsx`,
`src/features/sensory-world/README.md`,
`src/app/navigation/types.ts`, `src/app/navigation/RootNavigator.tsx`,
`src/services/audio/index.ts`, `docs/QA_ANDROID_INTERNAL_TESTING.md`.

---

## 6. Qué funciona

- Mundo Sensorial pasa de 5 a 7 actividades reales, las 7 alcanzables
  desde "¿Qué necesitas ahora?" en 1 toque, con "Terminar" siempre
  visible en ambas nuevas (mismo `ActivityFrame` que las 5 anteriores).
- "Sonidos y ritmo" funciona sin conexión (los tonos están bundleados en
  el APK/AAB, no se descargan).
- Ambas respetan "Vibración suave" y "Reducir movimiento" del perfil,
  igual que el resto del módulo.
- `npx tsc --noEmit` y `npx eslint .`: sin errores ni warnings.

## 7. Qué queda pendiente (fuera de alcance de V7, no de esta fase)

- Sonidos ambientales reales (lluvia, mar, viento, bosque, ruido blanco,
  agua) siguen sin poder construirse: necesitan grabaciones con licencia
  verificada que el proyecto no tiene. Sigue documentado como pendiente,
  no como error.
- Verificación de audio en dispositivo real (el entorno de esta sesión no
  tiene uno) — 7J.

---

## Cierre de Fase 7F

`npx tsc --noEmit` y `npx eslint .` sin errores. No se tocó
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS. Detenido aquí, a la espera de autorización para iniciar la Fase 7G.
