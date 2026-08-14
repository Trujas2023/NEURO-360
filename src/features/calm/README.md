# calm

Módulo "Calma": comunicación rápida para momentos de crisis o
sobreestimulación. Es uno de los cuatro tabs principales de `MainTabs`
(siempre a un toque de distancia).

Se separó de `aac-communicator` en la Fase 3 de V2, tal como anticipó
`docs/V2_ARCHITECTURE_AUDIT.md`: al sumar los flujos guiados dejó de ser
una pantalla suelta y pasó a ser un dominio propio.

## Contenido

- `data/emergencyVocabulary.ts`: las 15 frases del panel principal. Dos
  llevan `detail`, que habilita el botón "Contar más" hacia un flujo
  guiado.
- `data/painVocabulary.ts` / `data/overwhelmVocabulary.ts`: opciones y
  armado de la oración final de cada flujo. La gramática vive en los
  datos (artículo incluido en `phrase`, `plural` para el verbo, oraciones
  completas por opción en el flujo de saturación) para que la UI no tenga
  que resolver concordancia en español.
- `components/ChoiceStep.tsx`: un paso de flujo guiado (pregunta +
  opciones grandes), compartido por ambos flujos.
- `components/BodySilhouette.tsx`: silueta corporal tocable hecha con
  `View`s (sin SVG ni librerías de dibujo). Es un atajo para quien no
  lee, no el único camino: la grilla de partes cubre también las que no
  se distinguen en una silueta chica (oído, boca, dientes).
- `screens/CalmCommunicationScreen.tsx`: el panel principal (tab Calma).
- `screens/PainFlowScreen.tsx`: dónde → cuánto → cómo se siente → frase.
- `screens/OverwhelmFlowScreen.tsx`: qué te molesta → qué necesitas → frase.

## Criterios de interacción

- **Tocar una frase siempre habla**, nunca abre una pantalla: en una
  crisis, una navegación inesperada es lo peor que puede pasar. Los
  flujos guiados se abren desde un control aparte ("Contar más").
- **Los flujos avanzan solos** al elegir una opción (cada toque de más
  cuesta), y "Volver" retrocede un paso en vez de salir del flujo.
- **La frase final no se reproduce sola**: se dice con un botón
  explícito, igual que la barra de frase del comunicador. Audio por
  sorpresa es justo lo que hay que evitar con un niño desbordado.

`QuickCommunication` y el tipo `QuickPhrase` se importan desde
`aac-communicator` (son primitivas AAC compartidas, también usadas por
`help`). La dependencia va siempre en esa dirección: `calm` →
`aac-communicator`, nunca al revés.
