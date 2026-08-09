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
    aac-communicator/     # Fase 3-4 — comunicador "Mi Voz"
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
    audio/                  # Fase 4-5 — texto a voz y grabaciones

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
