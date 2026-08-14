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

Los ajustes por perfil (intensidad, patrón, velocidad, color, vibración,
modo de pintura) viven en `storage/sensorySettingsRepository.ts`,
registrado en `profileDataRegistry` para limpiarse si se borra el perfil.

## Pendiente: sonidos ambientales

La sexta actividad del prompt maestro (lluvia, mar, viento, bosque, ruido
blanco, agua) **no está implementada y no aparece en la navegación**, a
propósito: necesita archivos de audio con licencia adecuada y
`assets/sounds/` está vacío. Mostrarla vacía o con audio simulado sería
exactamente el tipo de pantalla a medio hacer que el proyecto no quiere.

Cuando haya audio real, la actividad necesita además la dependencia
`expo-audio` (hoy sin instalar, para no arrastrar una librería nativa que
no se usa) y la entrada "Sonidos" en `data/activities.ts`.
