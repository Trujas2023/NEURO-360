# aac-communicator

Comunicador visual "Mi Voz": tarjetas grandes con imagen/pictograma, texto
y voz; barra de frase; lectura en voz alta. Implementado en la Fase 3 y
extendido en la Fase 4 (quitar una tarjeta individual de la frase, botón
🔊 Hablar, y protección contra audio superpuesto en `@services/audio/speech`).

## Estructura

- `types.ts`: `AacCategory`, `AacCard` y tipos de entrada para crear/editar.
- `constants/categories.ts`: las 13 categorías iniciales (incluye la
  categoría virtual "Favoritos", que filtra tarjetas con `isFavorite`, no
  es una categoría real asignable).
- `constants/seedCards.ts`: vocabulario inicial que se siembra una única
  vez por perfil (ver `hooks/useAacCards.ts`).
- `storage/aacCardsRepository.ts`: persistencia por perfil sobre
  `@services/storage/asyncStorage` (una clave de AsyncStorage por
  `profileId`, así los perfiles nunca comparten tarjetas). Se registra en
  `@services/storage/profileDataRegistry` para que sus tarjetas se borren
  automáticamente cuando `ProfilesContext` elimina ese perfil.
- `hooks/useAacCards.ts`: CRUD + siembra automática; lo usan tanto las
  pantallas de Modo Niño como las de administración en Modo Adulto.
- `context/PhraseContext.tsx`: estado de la barra de frase en construcción
  (`addCard`, `removeAt`, `removeLast`, `clear`, `speakPhrase`). Se monta y
  desmonta junto con `navigation/AacNavigator.tsx`, así que se reinicia
  solo al salir de "Mi Voz".
- `components/`: `CategoryTile`, `AacCardTile`, `AacCardVisual` (foto o
  emoji), `PhraseBar`, `AacLayout` (envoltorio compartido de las pantallas
  de Modo Niño).
- `navigation/AacNavigator.tsx`: navegador anidado (Home de categorías →
  categoría/Favoritos) montado como una sola pantalla del stack raíz.
- `screens/AacHomeScreen.tsx`, `screens/AacCategoryScreen.tsx`: Modo Niño,
  sin ninguna función de edición o borrado.
- `screens/AacManagerScreen.tsx`, `screens/AacCardFormScreen.tsx`: Modo
  Adulto (alcanzables solo a través del PIN de `parent-mode`); alta,
  edición, eliminación, favorito y orden de tarjetas por perfil.

## Pendiente para fases posteriores

- Grabación de voz personalizada por tarjeta (Fase 5); por ahora todas las
  tarjetas usan texto a voz (`@services/audio/speech`).
- Historial de frases y ajustes de idioma por perfil (la arquitectura ya
  admite otros idiomas vía `DEFAULT_SPEECH_LANGUAGE`, pero no hay selector
  de idioma en la UI todavía).
