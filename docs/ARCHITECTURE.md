# Arquitectura — Sense & Play Adventures 360

## Stack

- **React Native + Expo (SDK 57) + TypeScript**, app nativa/híbrida real
  (no web, no PWA).
- **Managed workflow de Expo**: sin carpetas `android/`/`ios/` versionadas;
  se generan bajo demanda con `expo prebuild` / EAS Build cuando se necesite
  código nativo o el `.aab` final (Fase 12).
- **expo-build-properties** fija `compileSdkVersion` / `targetSdkVersion` en
  36 y `minSdkVersion` en 24 desde `app.json`, para no depender del valor
  por defecto de cada versión de Expo y cumplir con el requisito vigente de
  Google Play sobre target API.

## Principios de diseño

- **Offline-first**: el comunicador y los juegos deben funcionar sin
  conexión. Toda persistencia (Fase 9) se resuelve en el dispositivo, sin
  servicios en la nube ni sincronización remota.
- **Sin publicidad, rastreadores, ubicación, chat ni redes sociales.** No se
  incorporan SDKs de analítica/ads. Cualquier dependencia nueva debe
  justificarse contra este principio antes de instalarse.
- **Modular por dominio, no por tipo de archivo**: cada área de producto
  (`aac-communicator`, `sensory-games`, `profiles`, `parent-mode`) es un
  módulo independiente bajo `src/features`, y solo comparte lo genuinamente
  transversal a través de `src/shared` y `src/services`.
- **Componentes grandes, accesibles y reutilizables** (Fase 2 en adelante):
  botones con área táctil mínima de 64dp (`shared/theme/spacing.ts`),
  paleta de bajo contraste agresivo (`shared/theme/colors.ts`) para evitar
  sobreestimulación.
- **Dos modos de uso**: Modo Niño (comunicador + juegos únicamente) y Modo
  Adulto (protegido por PIN, Fase 8). La arquitectura de navegación
  (Fase 2) deberá impedir que el modo niño pueda alcanzar pantallas de
  configuración.

## Estructura de carpetas

```
App.tsx                  # entry point de Expo; re-exporta src/app/RootApp
index.ts                 # registerRootComponent (generado por Expo)
app.json                 # configuración de Expo (nombre, package, plugins)
babel.config.js          # preset de Expo + alias de módulos (@app, @shared, ...)
tsconfig.json            # TypeScript estricto + paths de alias

src/
  app/                    # composición raíz, navegación y pantallas de shell
    navigation/            # RootStackParamList + RootNavigator (Fase 2)
    screens/                # Welcome, Home (Modo Niño), ComingSoon (Fase 2)
    RootApp.tsx             # providers + NavigationContainer
  features/
    aac-communicator/     # Fase 3 — comunicador "Mi Voz" (ver README del feature)
      types.ts              # AacCategory, AacCard
      constants/             # categorías iniciales + vocabulario sembrado
      storage/                # persistencia por perfil (aacCardsRepository)
      hooks/                   # useAacCards (CRUD + siembra)
      context/                  # PhraseContext (barra de frase en curso)
      components/                # CategoryTile, AacCardTile, PhraseBar, ...
      navigation/                 # AacNavigator (stack anidado de Modo Niño)
      screens/                     # AacHome/AacCategory (niño) + Manager/CardForm (adulto)
    sensory-games/         # Fase 6-7 — "Juega & Regula"
    profiles/              # Fase 2 — perfiles, selector y alta/edición
    parent-mode/            # Fase 2 (PIN + admin básica) — Fase 8 la amplía
  shared/
    components/           # componentes de UI reutilizables (BigButton, ...)
    theme/                 # colores, espaciado, tipografía
    constants/              # constantes de app (nombre, modos, perfiles)
    hooks/                  # hooks compartidos
    types/                  # tipos de dominio compartidos
  services/
    storage/                # Fase 2 — perfiles/PIN vía AsyncStorage; Fase 9 lo amplía
    audio/                  # Fase 3 — texto a voz (speech.ts); Fase 5 agrega grabaciones

assets/
  images/, sounds/, fonts/  # medios estáticos del bundle

docs/
  ARCHITECTURE.md
  ROADMAP.md
  GOOGLE_PLAY_COMPLIANCE.md
```

## Alias de importación

Configurados en `babel.config.js` (`module-resolver`) y `tsconfig.json`
(`compilerOptions.paths`), deben mantenerse sincronizados entre ambos
archivos:

| Alias         | Ruta               |
| ------------- | ------------------- |
| `@app/*`      | `src/app/*`          |
| `@features/*` | `src/features/*`     |
| `@shared/*`   | `src/shared/*`        |
| `@services/*` | `src/services/*`      |
| `@assets/*`   | `assets/*`             |

## Estado de la Fase 1

Esta fase entrega únicamente la arquitectura base: scaffolding de Expo +
TypeScript, estructura de carpetas, tema/tokens provisionales, alias,
linting/formatting y esta documentación. `RootApp.tsx` es un placeholder
que confirma que el cableado funciona de punta a punta; no implementa
navegación ni pantallas de producto — eso corresponde a la Fase 2 en
adelante, según `docs/ROADMAP.md`.

## Estado de la Fase 2

Se implementa el sistema de navegación (`@react-navigation/native` +
native-stack) y la gestión de perfiles sobre la arquitectura de la Fase 1,
sin modificar su estructura de carpetas ni sus tokens de tema (solo se
agregan tokens de color nuevos y campos a `ChildProfile` de forma
aditiva). Incluye: Bienvenida, selector de perfil, alta/edición de perfil
(nombre, foto o color de avatar, preferencias básicas), Modo Niño (acceso a
"Mi Voz" y "Juega & Regula", ambos con pantalla `ComingSoon` hasta sus
fases correspondientes) y Modo Adulto protegido por PIN con administración
básica de perfiles. La persistencia usa
`@react-native-async-storage/async-storage` a través de
`src/services/storage`.

## Estado de la Fase 3

Sustituye la pantalla `ComingSoon` de "Mi Voz" por el comunicador AAC real,
sin tocar el resto de la Fase 2. Puntos de diseño relevantes:

- **Aislamiento por perfil real, no solo por tipo**: las tarjetas se
  guardan en AsyncStorage con una clave por `profileId`
  (`sense-play/aac/cards/<id>`), igual que perfiles y PIN. Nunca se leen ni
  escriben tarjetas de un perfil que no sea el pedido explícitamente.
- **Navegador anidado**: `AacNavigator` se monta como una sola pantalla del
  `RootNavigator` (ruta `AacCommunicator`) y trae su propio
  `PhraseContext`, que así se crea y destruye junto con la sesión de "Mi
  Voz" sin necesitar limpieza manual.
- **Separación Modo Niño / Modo Adulto reforzada**: `AacHomeScreen` y
  `AacCategoryScreen` (Modo Niño) no importan nada de edición; crear,
  editar, eliminar, marcar favorito o reordenar tarjetas vive únicamente en
  `AacManagerScreen`/`AacCardFormScreen`, alcanzables solo después del PIN
  de `PinGateScreen` (Fase 2).
- **Texto a voz local**: `services/audio/speech.ts` envuelve `expo-speech`
  (sin servicios externos de pago), español por defecto, con la API
  preparada para otros idiomas más adelante.
- **Extensión aditiva del endurecimiento de errores**: `getItem` en
  `services/storage/asyncStorage.ts` ahora captura `JSON.parse` inválido y
  devuelve `null` en vez de lanzar, beneficiando también a los
  repositorios de perfiles y PIN de la Fase 2.

## Estado de la Fase 4

Antes de esta fase se corrigió un dato huérfano detectado en la Fase 3: al
eliminar un perfil, sus tarjetas AAC quedaban en AsyncStorage sin
referencia. Se agregó `services/storage/profileDataRegistry.ts` (registro
de limpieza por perfil) y `aacCardsRepository.ts` se registra ahí; así
`ProfilesContext.deleteProfile` limpia los datos del perfil eliminado sin
que el feature `profiles` tenga que importar `aac-communicator`
directamente, y sin afectar a los demás perfiles.

Sobre esa base, la Fase 4 extiende el constructor de frases ya existente:

- `PhraseContext` suma `removeAt(index)` para quitar una tarjeta puntual de
  la frase (además de `removeLast` y `clear`, que se conservan); `PhraseBar`
  hace que cada palabra de la frase sea tocable para quitarla.
- `services/audio/speech.ts` serializa las llamadas a `expo-speech` en una
  cola de un solo elemento: cada `speak()` espera a que el anterior termine
  de detenerse antes de empezar, así toques rápidos y sucesivos nunca
  producen audio superpuesto.
- El botón de reproducir la frase pasa a mostrar el emoji 🔊 pedido en esta
  fase (antes ▶️), sin cambiar su comportamiento.
