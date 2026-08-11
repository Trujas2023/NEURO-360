# aac-communicator

Comunicador visual "Mi Voz": tarjetas grandes con imagen/pictograma o voz
grabada, texto, barra de frase y lectura en voz alta. Implementado en la
Fase 3, extendido en la Fase 4 (quitar una tarjeta individual de la frase,
botón 🔊 Hablar, protección contra audio superpuesto) y en v0.2 ("Mi Voz"
completo: 10 categorías, biblioteca de pictogramas ampliada, frases
rápidas, grabación de voz por tarjeta, favoritos, configuración visual por
perfil e historial básico de uso).

## Estructura

- `types.ts`: `AacCategory`, `AacCard` (incluye `audioUri`, `useCount`,
  `lastUsedAt`) y tipos de entrada para crear/editar.
- `constants/categories.ts`: las 10 categorías de v0.2 — Favoritos
  (virtual), Necesidades, Comida y bebida, Emociones, Personas, Lugares,
  Actividades, Dolor/malestar, Sí/No y Frases rápidas.
- `constants/seedCards.ts`: vocabulario inicial completo (v0.2) que se
  siembra una única vez por perfil (ver `hooks/useAacCards.ts`); las
  "Frases rápidas" son tarjetas con etiquetas de varias palabras que se
  hablan enteras en un solo toque, sin mecanismo aparte.
- `storage/aacCardsRepository.ts`: persistencia por perfil sobre
  `@services/storage/asyncStorage` (una clave de AsyncStorage por
  `profileId`). Al eliminar un perfil, además de quitar la clave, borra
  las fotos/audios de todas sus tarjetas vía `@services/media/localFiles`.
- `hooks/useAacCards.ts`: CRUD + siembra automática + `recordUsage`
  (historial básico, Módulo 13) + limpieza de fotos/audios reemplazados o
  eliminados. Lo usan tanto las pantallas de Modo Niño como las de
  administración en Modo Adulto.
- `hooks/useAacDisplaySettings.ts`: traduce las preferencias visuales del
  perfil activo (tamaño, modo de vista, columnas — Módulo 9) a medidas
  concretas para las grillas.
- `context/PhraseContext.tsx`: estado de la barra de frase en construcción
  (`addCard`, `removeAt`, `removeLast`, `clear`, `speakPhrase`); prioriza
  audio grabado sobre texto a voz y respeta la preferencia "Hablar al
  tocar pictograma". Se monta y desmonta junto con
  `navigation/AacNavigator.tsx`, así que se reinicia solo al salir de "Mi
  Voz".
- `components/`: `CategoryTile`, `AacCardTile`, `AacCardVisual` (foto o
  emoji, con respaldo si la foto falla al cargar), `AudioRecorderField`
  (grabar/reproducir/regrabar/eliminar voz), `PhraseBar`, `AacLayout`
  (envoltorio compartido de las pantallas de Modo Niño).
- `navigation/AacNavigator.tsx`: navegador anidado (Home de categorías →
  categoría/Favoritos) montado como una sola pantalla del stack raíz.
- `screens/AacHomeScreen.tsx`, `screens/AacCategoryScreen.tsx`: Modo Niño,
  sin ninguna función de edición o borrado.
- `screens/AacManagerScreen.tsx`, `screens/AacCardFormScreen.tsx`: Modo
  Adulto (alcanzables solo a través del PIN de `parent-mode`); alta,
  edición, eliminación, favorito, orden, foto y voz grabada de tarjetas
  por perfil, y un resumen de "Más utilizados".

## Pendiente para fases posteriores

- Selector de idioma en la UI (la arquitectura ya admite otros idiomas vía
  `DEFAULT_SPEECH_LANGUAGE` y el parámetro `language` de `speak()`).
- Historial de frases completas: a propósito no se implementó (Módulo 13
  pide explícitamente no registrar conversaciones completas sensibles).
