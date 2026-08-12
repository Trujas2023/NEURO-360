# Mi Voz AAC Pro — Fase 2 — Plan técnico

Este documento adapta el prompt maestro de "Mi Voz AAC Pro" a la arquitectura
real del repositorio (ver `ARCHITECTURE.md`), y registra qué se construyó en
esta pasada y qué queda pendiente. No reemplaza al `ROADMAP.md` general del
proyecto; lo complementa para el trabajo específico de esta rama.

## Punto de partida

El comunicador "Mi Voz" ya existía (Fases 3-4 del roadmap general) con:

- `PhraseContext` + `PhraseBar`: barra de frase con Hablar/Borrar/Limpiar.
- `AAC_CATEGORIES` (13 categorías) + tarjetas (`AacCard`) con emoji, foto,
  color, favorito y orden, persistidas por perfil en AsyncStorage.
- `AacManagerScreen` / `AacCardFormScreen`: alta/edición/eliminación de
  tarjetas en Modo Adulto (foto de galería o cámara vía `expo-image-picker`).
- Perfiles con preferencias (`ChildProfilePreferences`) y PIN de adulto.

No existían: vocabulario núcleo, buscador, más usados/recientes, ajustes de
personalización visual, Calma 360 ni Mi Día. Grabación de voz por adulto
tampoco existía (no hay dependencia de audio de grabación en `package.json`,
solo `expo-speech` para TTS).

## Decisiones de arquitectura para esta fase

- **No se tocan IDs de categorías existentes** (se agregan categorías
  nuevas al final de la lista) para no dejar huérfanas las tarjetas ya
  guardadas en dispositivos de prueba interna.
- **`AacCard` se extiende con campos opcionales** (`usageCount`, `active`,
  `audioUri` reservado a futuro) en vez de migrar el esquema: las tarjetas
  guardadas antes de esta fase se siguen leyendo igual, y los campos nuevos
  se resuelven con `?? valor por defecto` en tiempo de lectura.
- **`ChildProfilePreferences` se extiende** (no se reemplaza) con
  `speakOnTap`, `boardSize`, `textSize` y los toggles de
  mostrar texto/imagen/color/favoritos/más usados/barra de frase/categorías
  y confirmar antes de borrar. Perfiles ya guardados sin estos campos usan
  los defaults declarados en `DEFAULT_PROFILE_PREFERENCES` vía `??`.
- **Vocabulario núcleo no se persiste como `AacCard`**: vive en
  `data/coreVocabulary.ts` (estructura de datos, crece sin tocar código) y
  se renderiza como tarjetas efímeras que hablan y se agregan a la frase
  igual que una tarjeta normal, sin pasar por el repositorio de tarjetas.
- **Calma 360 reutiliza `speak()` directo** (no pasa por la barra de
  frase): son frases de uso inmediato, no una oración a construir.
- **Enlace a "Mundo Sensorial"**: el módulo real (`sensory-games`) todavía
  no existe (solo `ComingSoonScreen`, ver `HomeScreen.tsx`), así que el
  botón "Ir a Mundo Sensorial" navega al mismo stub ya usado por
  "Juega & Regula". No hay lógica interna de Mundo Sensorial que
  modificar todavía.
- **Mi Día es un módulo nuevo aislado** (`features/daily-routine`), con su
  propio storage por perfil (mismo patrón que `aacCardsRepository`,
  registrado en `profileDataRegistry` para limpiarse si se borra el
  perfil). No toca el comunicador.

## Qué se implementó en esta pasada

1. Barra de frase: respeta el nuevo ajuste "Hablar al tocar" (antes
   siempre hablaba al tocar una tarjeta).
2. Vocabulario núcleo (24 palabras del prompt maestro), siempre visible
   arriba de las categorías en `AacHomeScreen`.
3. Categorías profesionales: se agregan las que faltaban del prompt
   maestro (Acciones, Escuela, Casa, Juego, Objetos, Animales, Ropa,
   Rutinas, Emergencia, Palabras sociales) sin tocar las 13 existentes.
4. Motor de tarjetas reutilizable: `AacCardTile`/`AacCardVisual` ya eran
   reutilizables; se les suma contador de uso y campo de
   activa/inactiva.
5. Reproducción de frase: sin cambios de fondo, ahora coexiste con el modo
   "construcción de frase" (Hablar al tocar = OFF).
6. Buscador AAC local (tarjetas + vocabulario núcleo).
7. Favoritos / Más usados / Recientes como categorías virtuales.
8. Personalización (Modo Adulto → Ajustes de Mi Voz): tamaño de tablero,
   tamaño de texto, mostrar texto/imagen/color/favoritos/más
   usados/barra de frase/categorías, hablar al tocar, confirmar antes de
   borrar.
9. Calma 360: panel de frases de comunicación rápida + enlace a Mundo
   Sensorial, alcanzable en un toque desde cualquier pantalla de "Mi Voz".
10. Mi Día: rutinas visuales con pasos, indicador Primero/Después, botón
    Hecho, y alta/edición/eliminación de rutinas y pasos en Modo Adulto.

## Qué queda pendiente (no se tocó por alcance/riesgo)

- Grabación de voz personalizada por adulto (requiere agregar una
  dependencia nueva de audio — `expo-audio` — y permisos de micrófono en
  `app.json`; se deja fuera de esta pasada para no tocar configuración
  nativa sin validarlo primero con EAS/dispositivo real). El tipo
  `AacCard.audioUri` ya está reservado para cuando se implemente, con el
  orden de reproducción (audio si existe, si no TTS) documentado en
  `services/audio/speech.ts` como próximo paso.
- Contextos rápidos (Casa/Escuela/Terapia/…) que prioricen vocabulario sin
  duplicar tarjetas: no implementado, requiere diseño de UI adicional.
- Fotos/audio por paso de rutina en Mi Día (esta pasada usa emoji + texto
  por paso, igual que el vocabulario núcleo).
- Selector de voz/idioma por perfil.

## Identificadores y versión (sin cambios, verificado)

- `android.package` = `com.senseplayadventures.app`
- `ios.bundleIdentifier` = `com.senseplayadventures.app`
- `expo.version` = `0.1.0`
- `android.versionCode` = `1` (el prompt maestro menciona 4 como valor
  "estable actual"; el repositorio en esta rama tiene 1. No se modifica en
  ningún caso, tal como exige la regla de seguridad).
