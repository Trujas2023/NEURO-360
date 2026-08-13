# help

Botón de Ayuda global: frases de auxilio inmediato (Necesito ayuda, Me
duele, Tengo miedo, Me perdí, Quiero a mi adulto, Necesito salir), cada
una habla al tocarla. Agregado en Fase 1 de "Sense & Play 360 V2"
(`docs/V2_ARCHITECTURE_AUDIT.md`).

Reutiliza `QuickCommunication` de `aac-communicator` (el mismo componente
que usa Calma 360), generalizado para aceptar cualquier lista de frases en
vez de tener la de Calma cableada.

Alcanzable en un toque desde `MainTabHeader` (visible en los cuatro tabs
principales) y desde el botón "Ayuda" de `HomeScreen`.
