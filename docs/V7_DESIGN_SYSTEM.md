# Design System — Sense & Play Adventures 360 V7 (Fase 7C)

**Estado:** primera fase de V7 con cambios de código real. No toca
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS. No reestructura navegación (eso es 7D) ni construye pantallas nuevas
(eso es 7D en adelante) — es exclusivamente el sistema de diseño y su
adopción en el código ya existente que usa esos tokens.

**Insumos:** `docs/V7_PRODUCT_AUDIT.md` (7A) y `docs/V7_UX_ARCHITECTURE.md`
(7B, con la decisión ya confirmada de portrait-only §13.4).

---

## 1. Qué se hizo y por qué

Al inspeccionar el sistema de tokens (`src/shared/theme`) para "finalizarlo"
según pedía la auditoría (`colors.ts` se autodescribía como "provisional"),
se midió el contraste real de cada combinación texto/fondo con la fórmula
de luminancia relativa de WCAG 2.1, en vez de solo declarar la paleta
"definitiva" por decreto. Esa medición encontró un problema real, no
cosmético: **`colors.onPrimary` (texto blanco) nunca alcanza el mínimo de
contraste WCAG AA (4.5:1) sobre ningún color de la paleta** — toda la
paleta es deliberadamente pastel/clara (para evitar sobreestimulación
visual), así que texto blanco encima siempre queda por debajo de 2.6:1.

| Combinación | Contraste medido | ¿Pasa AA? |
|---|---|---|
| Texto blanco sobre `primary` | 2.26:1 | No |
| Texto blanco sobre `danger` | 2.53:1 | No |
| Texto blanco sobre los 6 colores de avatar | 1.56–2.40:1 | No, ninguno |
| Texto oscuro (`textPrimary`) sobre `primary` | 5.03:1 | Sí |
| Texto oscuro sobre `danger` | 4.50:1 | Sí |
| Texto oscuro sobre los 6 colores de avatar | 4.74–7.28:1 | Sí, todos |

**Decisión tomada:** no se re-tiñó la paleta (los 6 colores decorativos se
usan en ~35 lugares como acento/fondo de contenido — cambiar sus tonos
para forzar contraste con texto blanco habría sido un cambio visual mucho
más amplio que el problema real). En su lugar, se corrigió el **par**
texto/fondo: donde el código ponía texto blanco sobre un color de la
paleta, ahora pone `textPrimary` (oscuro). El color de fondo en sí no
cambió en ningún caso.

En la misma pasada por `shared/theme` se encontró un segundo problema real,
también medible y no cosmético: varios controles interactivos median menos
de los 48dp que `touchTargets.minimum` define como piso de accesibilidad
de la propia app — un patrón "swatch"/"chip"/"iconButton" de 40-44dp
copiado en 13 archivos distintos. Se corrigió cada instancia al piso de
48dp, usando el token `touchTargets.minimum` en vez de repetir el número,
para que no pueda volver a desviarse en silencio.

---

## 2. Contraste — 8 archivos corregidos

`color: colors.onPrimary` → `color: colors.textPrimary`, sin tocar ningún
`backgroundColor`:

- `src/shared/components/BigButton.tsx` (variantes `primary` y `danger`)
- `src/shared/components/ProfileAvatar.tsx` (inicial sobre avatar de color)
- `src/features/sensory-world/screens/SensoryPaintScreen.tsx` (chip de modo seleccionado)
- `src/features/sensory-world/screens/SensorySettingsScreen.tsx` (chip seleccionado)
- `src/features/aac-communicator/screens/AacSettingsScreen.tsx` (chip seleccionado)
- `src/features/daily-routine/components/StepViews.tsx` (badge PRIMERO/DESPUÉS/AHORA)
- `src/features/daily-routine/screens/RoutineFormScreen.tsx` (chip de modo seleccionado)
- `src/features/games/screens/GamesSettingsScreen.tsx` (chip seleccionado)

`colors.ts` queda con un comentario explícito documentando la regla para
que no se repita: ningún tono de la paleta debe llevar `onPrimary` encima.

---

## 3. Objetivo táctil — 13 archivos corregidos a ≥48dp

Todos los casos eran controles reales (`Pressable` con
`accessibilityRole="button"`), no elementos decorativos — verificado uno
por uno antes de tocarlos, no por patrón de nombre. Todos ahora usan
`touchTargets.minimum` (48) en vez de un número suelto:

| Archivo | Elemento | Antes |
|---|---|---|
| `AacManagerScreen.tsx` | `iconButton` (favorito/mover) | 40×40 |
| `AacCardFormScreen.tsx` | `swatch` (color de tarjeta) | 40×40 |
| `AacSettingsScreen.tsx` | `chip` (sin mínimo — se agregó) | ~30px |
| `ProfileFormScreen.tsx` | `swatch` (color de avatar) | 40×40 |
| `RoutineManagerScreen.tsx` | `iconButton` (mover rutina) | 40×40 |
| `RoutineFormScreen.tsx` | `swatch`, `modeChip` (sin mínimo), `durationChip`, `iconButton` | 40 / — / 40 / 40 |
| `SensoryPaintScreen.tsx` | `swatch` (color de pintura), `modeChip` | 44×44 / 44 |
| `SensorySettingsScreen.tsx` | `chip`, `swatch` | 44 / 44×44 |
| `PhraseBar.tsx` | `chip` (palabra en la barra de frase) | 44 |
| `SavedPhrasesRow.tsx` | `deleteButton` (borrar frase guardada) | 44×44 |
| `GamesSettingsScreen.tsx` | `chip` (dificultad/duración) | 44 |
| `QuickCommunication.tsx` | `detailButton` ("Contar más ›") | 32 |

No se tocó ninguna lógica de estos componentes — solo la propiedad de
tamaño/mínimo en su `StyleSheet`. Las interacciones, el estado
seleccionado y la navegación siguen exactamente igual.

---

## 4. Estados de `BigButton` — se agregó `loading`

La Regla 3 del brief V7 pide estados pressed/disabled/loading/error
consistentes. `BigButton` ya tenía pressed y disabled; faltaba loading.
Se agregó `loading?: boolean`: reemplaza el contenido por un
`ActivityIndicator` del color de texto de la variante, bloquea el toque
(`accessibilityState.busy`) y mantiene el mismo alto — no salta el layout
al activarse.

Se adoptó de inmediato en los 3 formularios que ya tenían un estado
`saving` bloqueando el botón sin mostrar ningún indicador visual
(`ProfileFormScreen`, `AacCardFormScreen`, `RoutineFormScreen`): antes el
botón "Guardar" solo se atenuaba mientras guardaba, sin ninguna señal de
qué estaba pasando; ahora muestra el spinner. Cambio de una línea por
archivo (`disabled={saving}` → `loading={saving}`), sin tocar la lógica de
guardado.

---

## 5. Iconografía — `@expo/vector-icons` como librería sancionada

**Decisión:** `@expo/vector-icons` (ya viene con el SDK de Expo, se fijó
`^15.0.2` — la versión que Expo SDK 57 declara compatible; no es una
dependencia nueva de terceros). Familia elegida: **Ionicons**, con
convención relleno-cuando-activo / contorno-cuando-inactivo.

**Alcance real de 7C — piloto en el chrome global, no una migración
completa de los ~115 usos de emoji de la app:**
- Los 4 íconos de la barra inferior (`MainTabs.tsx`): Inicio, Mi Voz,
  Calma, Mi Día.
- El botón "Ayuda" persistente (`MainTabHeader.tsx`).

Se eligió el chrome global porque es lo único que se ve en *todas* las
pantallas de Modo Niño sin excepción, y porque reemplazar sistemáticamente
el resto de los emoji (categorías, tarjetas AAC, juegos, actividades
sensoriales) es trabajo de curación pantalla por pantalla que corresponde
a las fases que tocan cada una de esas pantallas (7D en adelante), no a
"construir el sistema de diseño". Migrar el resto ahora habría sido tocar
código que ya funciona sin necesidad, contra la instrucción explícita de
no refactorizar de más.

---

## 6. Componente nuevo: `EntityGridCard`

Implementado en `src/shared/components/EntityGridCard.tsx` exactamente
según el contrato definido en `docs/V7_UX_ARCHITECTURE.md` §11 (props
`emoji`, `label`, `description?`, `accentColor`, `onPress`,
`accessibilityLabel`, `accessibilityHint?`, `badge?`). Usa
`shadows.sm` — primer consumidor real de ese token, definido desde Fase 1
del proyecto y nunca antes usado en ninguna pantalla.

**Explícitamente no adoptado todavía en ninguna pantalla** — por diseño,
según la trazabilidad de 7B: `SensoryHomeScreen`, `GamesHomeScreen`,
`MyDayScreen` y la futura `HomeScreen`/`AdultCenterScreen` siguen con su
grilla actual hasta que 7D/7E/7F las toquen. Construir el componente ahora
y cablearlo después evita que cada fase reinvente su propia versión
mientras tanto.

---

## 7. Archivos modificados

`package.json`/`package-lock.json` (nueva dependencia
`@expo/vector-icons@^15.1.1`, compatible con Expo SDK 57), `colors.ts`,
`BigButton.tsx`, `ProfileAvatar.tsx`, `shared/components/index.ts`,
`EntityGridCard.tsx` (nuevo), `MainTabs.tsx`, `MainTabHeader.tsx`, y los 13
archivos de pantalla/componente listados en §2 y §3.

---

## 8. Qué funciona

- Contraste WCAG AA real en todos los botones/chips/avatares que antes
  fallaban (medido, no solo declarado).
- 100% de los controles interactivos auditados cumplen el piso de 48dp que
  la propia app se exige.
- `BigButton` tiene loading real, adoptado en los 3 formularios que lo
  necesitaban.
- Barra inferior y botón de Ayuda con iconografía vectorial consistente.
- `EntityGridCard` listo para usarse, validado por TypeScript/ESLint.
- `npx tsc --noEmit` y `npx eslint .`: sin errores ni warnings.

## 9. Qué queda pendiente (fases futuras, no de esta)

- Adopción de `EntityGridCard` en pantallas reales — 7D/7E/7F.
- Migración del resto de los emoji a Ionicons donde 7C decidió no tocarlos
  todavía — se decide caso por caso cuando cada pantalla se reestructura.
- Centro Adulto, Home, Welcome, secciones nuevas — 7D en adelante, sin
  cambios en esta fase.
- Verificación visual en dispositivo real (este entorno no tiene uno) —
  7J.

---

## Cierre de Fase 7C

`npx tsc --noEmit` y `npx eslint .` sin errores. No se tocó
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS. Detenido aquí, a la espera de autorización para iniciar la Fase 7D.
