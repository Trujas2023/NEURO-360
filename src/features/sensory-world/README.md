# sensory-world

Módulo "Mundo Sensorial": actividades de regulación. Se entra por
necesidad ("¿qué necesitas ahora?") y no por nombre de actividad, porque
el niño rara vez sabe cómo se llama la actividad pero sí puede reconocer
qué le está pasando.

## Reglas comunes a todas las actividades

- **`Terminar` siempre visible** (`components/ActivityFrame.tsx`): ninguna
  actividad atrapa al niño, y salir nunca depende de completar nada ni de
  esperar un cronómetro.
- **Sin puntaje, sin fracaso, sin final obligatorio.** Son actividades de
  regulación, no juegos que se ganan (los juegos van en Fase 6).
- **`reduceMotion` del perfil ralentiza, no elimina**: las burbujas suben
  más despacio y aparecen menos seguido, el objeto de seguimiento va más
  lento. La actividad sigue existiendo.
- Vibración suave y opcional vía `@services/haptics` — siempre "light",
  nunca una alarma, y falla en silencio si el dispositivo no la admite.

## Actividades

| Actividad | Pantalla | Notas |
| --- | --- | --- |
| Burbujas | `BubblesScreen` | `Animated` + tope de burbujas en pantalla |
| Respiración | `BreathingScreen` | Patrones 3-3-4 / 4-4-4 / 4-2-6 |
| Seguimiento visual | `VisualTrackingScreen` | Movimiento lineal y predecible a propósito |
| Pintura | `SensoryPaintScreen` | `PanResponder` (nativo de RN) + `react-native-svg` |
| Causa y efecto | `CauseEffectScreen` | Cada toque produce forma + vibración |
| Sonidos y ritmo | `SensorySoundRhythmScreen` | Fase 7F. Tonos propios (ver abajo) |
| Acuario | `SensoryAquariumScreen` | Fase 7F. `react-native-svg`, sin audio |

Los ajustes por perfil (intensidad, patrón, velocidad, color, vibración,
modo de pintura) viven en `storage/sensorySettingsRepository.ts`,
registrado en `profileDataRegistry` para limpiarse si se borra el perfil.

## "Sonidos y ritmo" — tonos propios, no audio de terceros

Los 6 archivos de `assets/sounds/tone_*.wav` **no son grabaciones de
nada**: son ondas sinusoidales sintetizadas por código (escala
pentatónica de Do, con armónicos suaves y una envolvente tipo campana),
generadas con un script de un solo uso al construir la actividad. No hay
ninguna licencia que verificar porque no hay ninguna obra de terceros
involucrada — es exactamente el motivo por el que esta actividad sí pudo
construirse mientras que sonidos ambientales reales (lluvia, mar, viento,
bosque) siguen sin poder agregarse: esos sí necesitarían audio grabado con
licencia adecuada, y `assets/sounds/` no tiene ninguno. Si en el futuro se
agregan sonidos ambientales reales, van aparte de estos tonos (que no se
tocan) y necesitan su propia fuente verificada antes de escribir código.
