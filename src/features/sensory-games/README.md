# sensory-games

Módulo "Juega & Regula": seis minijuegos sensoriales (Revienta burbujas,
Pintura sensorial, Toca y escucha, Sigue el color, ¿Cómo me siento?,
Respira conmigo). Se implementa en las Fases 6 y 7.

Cada juego vive en su propia subcarpeta (`bubble-pop/`, `sensory-paint/`,
`touch-and-listen/`, `follow-the-color/`, `how-i-feel/`, `breathe-with-me/`)
para mantener el módulo escalable y desacoplado.

## Estructura

- `types.ts`: `SensoryGameInfo` (catálogo de juegos: id, título, emoji,
  color y `route` opcional dentro de `SensoryGamesNavigator`).
- `constants/games.ts`: los seis juegos planeados; los que todavía no
  tienen `route` navegan a `ComingSoon` (stack raíz) con su propio
  título/emoji en vez de tener pantalla propia.
- `components/GameTile.tsx`: botón grande de juego para el catálogo,
  mismo patrón que `CategoryTile` de `aac-communicator`.
- `screens/SensoryGamesHomeScreen.tsx`: catálogo de juegos (Modo Niño).
- `navigation/SensoryGamesNavigator.tsx`: navegador anidado (catálogo →
  juego), montado como una sola pantalla del stack raíz, mismo patrón que
  `AacNavigator`.
- `bubble-pop/BubblePopScreen.tsx`: primer juego implementado (Fase 6).

## Revienta burbujas (Fase 6)

Burbujas que aparecen en posiciones aleatorias y se "revientan" al
tocarlas (animación de escala con `Animated`, sin dependencias nuevas);
cada burbuja reventada reaparece sola en otra posición. Sin puntaje que
penalice, sin límite de tiempo y sin sonido: el objetivo es la regulación
por estimulación táctil/visual repetitiva, no competir ni fallar. No
persiste datos por perfil (igual que Calma 360: es juego momentáneo, no
información a conservar).

## Pendiente para fases posteriores

- Los otros cinco juegos del catálogo (Fase 7).
- Progreso o preferencias de juego por perfil, si se decide que hace
  falta (Fase 9 — almacenamiento offline).
