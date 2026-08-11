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

## Sonido: efectos de audio reales, sin texto a voz

Los efectos de sonido de Mundo Sensorial (Burbujas, Sigue la luz, Toca y
escucha) son archivos WAV reales, generados una sola vez y empaquetados
en `assets/sounds/sensory/` (mono, 22.05 kHz, 16 bits) — no hay texto a
voz simulando sonidos ni servicios externos ni descargas en tiempo de
ejecución. `constants/soundAssets.ts` los importa con `require()`/
`import` (Metro los incluye en el binario) y `hooks/useSensoryFeedback.ts`
los reproduce con `expo-audio` (`createAudioPlayer`), la misma librería
que ya usa el comunicador AAC para las grabaciones de voz personalizadas.
Cada reproductor es de corta vida: se libera solo al terminar de sonar.

Los ocho sonidos de "Toca y escucha" (`bird.wav`, `water_drop.wav`,
`waves.wav`, `bell.wav`, `drum.wav`, `clap.wav`, `cat.wav`,
`car_horn.wav`), el "pop" de Burbujas (`bubble_pop.wav`) y el destello
positivo de Sigue la luz (`sparkle.wav`) están todos suavizados (ataque y
caída graduales, sin clics ni picos) y normalizados a un volumen
moderado, pensados para no sobresaltar a niños con hipersensibilidad
auditiva.
