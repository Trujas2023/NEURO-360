# Navegación y Home — Sense & Play Adventures 360 V7 (Fase 7D)

**Estado:** segunda fase de V7 con código real, acotada exactamente a lo
que `docs/V7_UX_ARCHITECTURE.md` (7B) asignó a 7D: Centro Adulto (nivel 1),
Home rediseñado, Welcome con marca real, eliminación de `ComingSoon`, árbol
de navegación final. No toca `android.package`, `ios.bundleIdentifier`,
`versionCode` ni configuración EAS.

---

## 1. Centro Adulto (`AdultCenterScreen`, reemplaza `AdultHomeScreen`)

**Problema que resolvía** (`docs/V7_PRODUCT_AUDIT.md` §4.8/§9): la vieja
`AdultHomeScreen` era una lista de perfiles con 7 botones por fila
(Tarjetas/Ajustes AAC/Mi Día/Sensorial/Juegos/Editar/Eliminar) envueltos en
varias líneas, sin ninguna sección.

**Estructura nueva**, siguiendo `docs/V7_UX_ARCHITECTURE.md` §7:
1. Arriba, selector de qué perfil administrar (tarjetas de perfil, la
   seleccionada queda marcada — se agregó `selected`/`accessibilityLabel`
   a `ProfileCard`, aditivo, sin romper su único uso previo en
   `ProfileSelectorScreen`) + alta/edición/eliminación de perfiles ahí
   mismo (mismas acciones y confirmaciones que antes, reubicadas).
2. Abajo, una grilla de 4 secciones sobre el perfil elegido — **primer uso
   real de `EntityGridCard`** (construido en 7C, sin adoptar hasta ahora):
   Mi Voz, Mundo Sensorial, Juega & Regula, Mi Día. Cada una navega a las
   pantallas de ajuste que ya existían (`AacManager`/`AacSettings`,
   `SensorySettings`, `GamesSettings`, `RoutineManager`) **sin modificar
   ninguna de ellas** — solo cambió cómo se llega.
3. "Mi Voz" abre un `Alert` con las dos sub-opciones (Tarjetas / Ajustes de
   voz) en vez de dos tarjetas sueltas, tal como pedía la especificación
   de 7B ("agrupados bajo una sub-selección").

**Decisión explícita — qué no incluye todavía:** las 3 secciones nuevas
del documento de arquitectura (Accesibilidad, Estadísticas, Respaldo) no
tienen tarjeta en esta grilla. Agregar una tarjeta que abra una pantalla
sin función real habría sido reconstruir exactamente el problema que esta
fase eliminó en otro lugar (`ComingSoonScreen`, ver abajo). Esas 3 se
agregan en la Fase 7H, cuando existan de verdad — en ese momento, agregar
su tarjeta a esta grilla es un cambio de una línea por sección, no una
reestructuración.

**Extensión de `EntityGridCard`** (7C la construyó solo con `emoji`): las
secciones de Centro Adulto no tienen un emoji propio como sí lo tienen
categorías/juegos/rutinas, así que se agregó un prop `icon` alternativo
(`@expo/vector-icons`, mismo convenio ya sancionado en 7C para el chrome
global). El color de acento (`accentColor`) sigue usándose para el borde;
el ícono en sí se renderiza en `textPrimary`, no en `accentColor` — medido:
ningún tono de la paleta pastel llega al mínimo de contraste no-textual de
WCAG (3:1) sobre el fondo blanco de la tarjeta (2.10–2.40:1 en los 4
colores usados aquí).

---

## 2. `HomeScreen` rediseñado

**Problema que resolvía** (`docs/V7_PRODUCT_AUDIT.md` §6.6): Calma y Mi
Día ya eran tabs de la barra inferior *y* botones en Home; Sensorial y
Jugar solo existían como botones en Home, con un tratamiento visual
distinto (dos filas de 2, estilos diferentes).

**Cambio:** los 4 sistemas (Calma, Sensorial, Jugar, Mi Día) ahora son una
sola grilla de 4 `EntityGridCard` con el mismo tratamiento entre sí — nadie
se lee como "más importante" que los demás desde Inicio. La acción
primaria ("Quiero comunicarme") y "Ayuda" no cambiaron: siguen siendo las
dos acciones con tratamiento distinto a propósito (una es la función más
usada, la otra es auxilio de emergencia).

**Íconos reusados, no inventados de nuevo:** Calma → `happy` (mismo que su
tab), Mi Día → `calendar` (mismo que su tab), Sensorial → `leaf` (mismo
que su tarjeta en Centro Adulto), Jugar → `game-controller` (ídem) — el
mismo destino usa el mismo ícono en cualquier pantalla de la app.

**Limpieza incluida:** se quitó el comentario y el estilo
`comingSoonNote` (CSS muerto desde que Sensorial/Jugar dejaron de ser
`ComingSoon`, señalado en la auditoría §6.1) y el comentario que todavía
decía que esos dos módulos "no tienen módulo real".

---

## 3. `WelcomeScreen` con marca real

**Problema que resolvía** (`docs/V7_PRODUCT_AUDIT.md` §1/§9): un solo
emoji 🌈 en un círculo blanco, sin ningún elemento de marca.

**Verificación antes de tocar nada:** se revisaron los únicos dos PNG
reales del repo (`assets/icon.png`, `assets/splash-icon.png`) para
confirmar si eran usables. Ambos resultaron ser el **ícono y splash por
defecto de la plantilla de Expo** (un chevron azul genérico y un blanco
circular de guía de diseño), sin ninguna relación con la identidad de la
app — usarlos habría sido peor que el emoji. `assets/fonts` e
`assets/images` siguen vacíos.

**Solución sin assets nuevos:** insignia de dos capas (círculo
`colors.secondary` + círculo interior `colors.surface`) con un ícono
vectorial (`planet`, evoca "Adventures 360") en `textPrimary`, más una
composición tipográfica de dos líneas con jerarquía real ("Sense & Play"
grande y en negrita, "ADVENTURES 360" más chico con tracking) en vez del
título de una sola línea. Se midió el contraste de la opción con color de
acento (`primaryDark` sobre el fondo crema: 2.97:1) y no pasaba ni el
mínimo de texto grande — se usa `textSecondary` (4.97:1) en su lugar.

---

## 4. Eliminación de `ComingSoonScreen`

Confirmado en la auditoría (§5/§7.1): la ruta `ComingSoon` estaba
registrada en el stack con un componente real, pero ningún botón de la app
navegaba a ella — remanente de cuando Mundo Sensorial y Juega & Regula
todavía no existían. Se eliminó el archivo, su tipo en
`RootStackParamList` y su registro en `RootNavigator`. Cero referencias
restantes en `src/` (verificado con búsqueda exhaustiva).

---

## 5. Árbol de navegación — implementado tal como lo definió 7B §4

`RootStackParamList.AdultHome` → `AdultCenter` (con su pantalla nueva).
`PinGateScreen` actualizado en sus 2 puntos de `navigation.replace(...)`.
`ComingSoon` eliminado del tipo. El resto del árbol (tabs, `AacNavigator`
anidado, Mundo Sensorial y Juegos fuera de tabs) no cambió — ya coincidía
con la propuesta de 7B.

---

## 6. Archivos modificados/creados/eliminados

**Nuevo:** `src/features/parent-mode/screens/AdultCenterScreen.tsx`.

**Eliminados:** `src/app/screens/ComingSoonScreen.tsx`,
`src/features/parent-mode/screens/AdultHomeScreen.tsx`.

**Modificados:** `src/app/navigation/types.ts`,
`src/app/navigation/RootNavigator.tsx`, `src/app/screens/HomeScreen.tsx`,
`src/app/screens/WelcomeScreen.tsx`,
`src/features/parent-mode/screens/PinGateScreen.tsx`,
`src/features/profiles/components/ProfileCard.tsx` (prop `selected`
aditivo), `src/shared/components/EntityGridCard.tsx` (prop `icon`
aditivo), `src/features/calm/screens/CalmCommunicationScreen.tsx`
(comentario desactualizado corregido).

---

## 7. Qué funciona

- Centro Adulto: seleccionar perfil, agregar/editar/eliminar perfil,
  administrar Mi Voz (tarjetas y ajustes)/Mundo Sensorial/Juegos/Mi Día de
  ese perfil — todo reutilizando pantallas ya probadas, sin lógica nueva
  de fondo.
- Home: los 4 sistemas con trato visual idéntico, más "Quiero
  comunicarme" y "Ayuda" sin cambios de comportamiento.
- Welcome: marca real sin depender de ningún asset nuevo.
- Cero rutas huérfanas (`ComingSoon` ya no existe en absoluto).
- `npx tsc --noEmit` y `npx eslint .`: sin errores ni warnings.

## 8. Qué queda pendiente (fases futuras)

- Accesibilidad, Estadísticas, Respaldo como secciones de Centro Adulto —
  7H.
- Adopción de `EntityGridCard` en `SensoryHomeScreen`, `GamesHomeScreen`,
  `MyDayScreen` — 7E/7F (esta fase solo la adoptó en Home y Centro
  Adulto).
- Migración del resto de los emoji de contenido a íconos — se sigue
  decidiendo pantalla por pantalla, no de una vez.
- Verificación visual en dispositivo real — 7J.

---

## Cierre de Fase 7D

`npx tsc --noEmit` y `npx eslint .` sin errores. No se tocó
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS. Detenido aquí, a la espera de autorización para iniciar la Fase 7E.
