# games

Módulo "Juega & Regula": seis juegos completos, implementados en la Fase 6
de V2.

Ojo con la historia del nombre: esta carpeta se llamaba `sensory-games` y
describía una mezcla de juegos y actividades sensoriales. V2 separa las
dos cosas — las *actividades* de regulación (burbujas, respiración,
seguimiento visual, pintura, causa y efecto) viven en
`features/sensory-world`, y acá quedan solo los juegos con objetivo.

## Los seis juegos

| Juego | Pantalla | Mecánica |
| --- | --- | --- |
| Colores | `ColorMatchScreen` | Emparejar (motor compartido) |
| Formas | `ShapeMatchScreen` | Emparejar (motor compartido) |
| Emociones | `EmotionsScreen` | Emparejar (motor compartido) |
| Clasificar | `CategorySortScreen` | Emparejar (motor compartido) |
| Memoria | `MemoryScreen` | Parejas boca abajo |
| Secuencias | `SequenceScreen` | Repetir un orden |

Los cuatro primeros comparten `components/ChoiceGame.tsx`: todos tienen
la misma estructura (consigna, opciones, elegir), así que comparten una
sola implementación de la interacción y cada juego aporta únicamente su
contenido mediante una función `makeRound` **definida a nivel de módulo**
— el motor la usa en callbacks y efectos, y una identidad cambiante haría
avanzar rondas de más.

## Reglas de diseño comunes

- **Nunca hay mensaje de fracaso.** El feedback tiene dos estados:
  `good` ("¡Bien!") y `retry` ("Intentemos otra vez"). Equivocarse no
  resta, no interrumpe la ronda y no termina la partida.
- **La vibración se reserva para el acierto.** Equivocarse nunca vibra,
  para que el refuerzo táctil quede asociado solo al logro.
- **No hay cronómetro.** La duración de la partida se mide en rondas
  (`GameSessionLength`), nunca en segundos: una cuenta regresiva es
  justo la presión que estos juegos evitan. Se muestra "ronda X de Y".
- **`Terminar` siempre visible** (`components/GameFrame.tsx`), igual que
  en Mundo Sensorial.
- **Las formas se dibujan en SVG**, no con emoji: el emoji cambia de
  dibujo según el sistema operativo, y en un juego de emparejar formas la
  forma exacta *es* el contenido.
- En Formas, todas las figuras se muestran del mismo color a propósito:
  con colores distintos se podría acertar sin mirar la forma.

El sonido usa el texto a voz del dispositivo (`expo-speech`), no archivos
de audio: lee la consigna y celebra los aciertos. Por eso los juegos no
dependen de `assets/sounds/`, que sigue vacío.

## Estadísticas (Fase 7I)

`storage/gameStatsRepository.ts` guarda, por perfil, cuántas partidas
completó cada juego y cuándo fue la última (`sessionsCompleted` /
`lastPlayedAt`). Cada pantalla llama a `recordGameSession(profileId,
gameId)` una sola vez, en el mismo efecto que detecta que la partida
terminó (`finished`). No cuenta partidas abandonadas a mitad de camino,
a propósito: solo interesa lo que el niño efectivamente logró. El Centro
Adulto lo muestra en `parent-mode/screens/StatisticsScreen.tsx`, junto a
las rutinas completadas de Mi Día y el uso de Mi Voz.
