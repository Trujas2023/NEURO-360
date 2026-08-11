# sensory-games

Módulo "Juega & Regula" / Mundo Sensorial: seis minijuegos sensoriales sin
puntuación obligatoria, pensados para regular estímulos, no para competir.
Implementado en la Fase 2 (Mundo Sensorial).

## Juegos

1. 🫧 **Burbujas** (`games/BubblesGame.tsx`) — burbujas de distinto tamaño
   que suben lento; tocarlas las revienta y aparece una nueva.
2. 🎨 **Colores mágicos** (`games/MagicColorsGame.tsx`) — tocar/arrastrar
   deja círculos o manchas de color (paleta suave o viva).
3. ✨ **Sigue la luz** (`games/FollowTheLightGame.tsx`) — una luz se mueve
   lento (horizontal/vertical/circular/aleatoria suave); tocarla da una
   pequeña animación.
4. 🎵 **Toca y escucha** (`games/TouchAndListenGame.tsx`) — botones
   causa-efecto grandes que reproducen un sonido corto.
5. 🌊 **Ondas calmantes** (`games/CalmWavesGame.tsx`) — fondo relajante
   (agua/estrellas/círculos/luz suave); cada toque deja ondas suaves.
6. 🖌️ **Dibujo sensorial** (`games/SensoryDrawingGame.tsx`) — lienzo
   táctil libre, sin registro ni guardado automático.

## Estructura

- `types/index.ts`: tipos de dominio propios (`SensoryPreferences`,
  identificadores de juego, opciones de cada juego). Las preferencias de
  sonido general y reducción de movimiento ya existentes en
  `ChildProfilePreferences` (Fase 2) se reutilizan tal cual — no se
  duplican acá, para no mezclar la lógica de los juegos con la del
  comunicador AAC.
- `constants/games.ts`: las 6 tarjetas de juego, valores por defecto de
  `SensoryPreferences` y las tablas de velocidad/densidad visual.
- `storage/sensoryPreferencesRepository.ts`: persistencia por perfil sobre
  `@services/storage/asyncStorage` (una clave por `profileId`, aislada de
  cualquier otro perfil). Registrado en
  `@services/storage/profileDataRegistry` para limpiarse solo si se
  elimina el perfil.
- `hooks/`: `useSensoryPreferences` (carga/guarda), `useSensoryRuntime`
  (combina esas preferencias con `ChildProfilePreferences` en valores
  listos para usar) y `useSensoryFeedback` (sonido/vibración con el
  ON/OFF que decide cada juego en el momento).
- `components/`: `GameCard`, `SensoryLayout` (encabezado ← Volver +
  título), `ToggleIconButton` (48dp).
- `navigation/`: `SensoryNavigator`, navegador anidado montado como una
  sola pantalla del stack raíz (ruta `SensoryWorld`), igual que
  `AacNavigator` para el comunicador.
- `screens/`: `SensoryHomeScreen` (grilla de juegos + Ajustes sensoriales
  + Volver), una pantalla por juego, y `SensorySettingsScreen` (Modo
  Adulto, alcanzable solo vía PIN).

## Personalización dentro de cada juego

Los ajustes "Configurable" de cada juego (velocidad, cantidad, paleta,
trayectoria, volumen, sonidos disponibles, grosor, brillo, etc.) son
controles del propio juego, visibles con el botón ⚙️ de su pantalla, y no
se persisten: se inician con los valores por defecto del perfil
(`useSensoryRuntime`) y el niño o quien lo acompañe los puede ajustar
libremente mientras juega, sin necesitar el PIN de Modo Adulto.

Los ajustes **generales por perfil** (sonido, vibración, velocidad de
animaciones, nivel visual, duración de sesión, modo reducido de
estímulos) sí requieren Modo Adulto: se editan en `SensorySettingsScreen`,
alcanzable únicamente tocando "Ajustes sensoriales" en Mundo Sensorial y
pasando el PIN (`PinGateScreen`, con un `redirect` configurable que no
altera su comportamiento por defecto hacia `AdultHome`).

## Sonido sin archivos de audio

No hay archivos de audio empaquetados ni servicios externos: "Toca y
escucha" y el "pop" de Burbujas reutilizan `@services/audio/speech`
(texto a voz local) con onomatopeyas cortas ("pío pío", "splash", "pop",
...). Es una limitación conocida frente a grabaciones reales; ver el
informe de la Fase 2 para más detalle.
