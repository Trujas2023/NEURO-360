# Roadmap por fases

El desarrollo avanza por fases; cada una se entrega y valida antes de pasar
a la siguiente.

- [x] **Fase 1 — Arquitectura del proyecto.**
- [x] **Fase 2 — Sistema de navegación y perfiles.**
- [x] **Fase 3 — Comunicador AAC.** Incluye, adelantado de fases futuras:
  constructor de frases y texto a voz (Fase 4), y personalización básica de
  tarjetas con foto por perfil (parte de Fase 5). Pendiente para más
  adelante: grabación de voz personalizada y selector de idioma en la UI.
- [x] **Fase 4 — Constructor de frases y voz.** Sobre la base de la Fase 3:
  eliminar una tarjeta individual de la frase (no solo la última), botón
  🔊 Hablar, y una cola de reproducción que serializa las llamadas a
  `expo-speech` para que toques rápidos no generen audio superpuesto.
  Antes de esta fase se corrigió un dato huérfano: al eliminar un perfil
  ahora también se borran sus tarjetas AAC (`services/storage/profileDataRegistry.ts`).
- [x] **v0.2 — "Mi Voz" AAC completo.** Ver `docs/ARCHITECTURE.md` para el
  detalle. Consolida el comunicador: 10 categorías, biblioteca de
  pictogramas ampliada, frases rápidas, grabación de voz por tarjeta
  (con prioridad sobre texto a voz), fotos/audios persistidos en
  almacenamiento local propio de la app, favoritos, configuración visual
  por perfil (tamaño/columnas/modo de vista) e historial básico de uso.
  Corrección de mantenimiento incluida: al eliminar un perfil o una
  tarjeta también se borran sus fotos/audios asociados.
- [ ] Fase 5 — Personalización para padres *(cubierta por v0.2: tarjetas, fotos y grabación de voz; falta lo que surja más adelante)*.
- [x] **Fase 2 (Mundo Sensorial) — "Juega & Regula" completo.** Ver
  `src/features/sensory-games/README.md` y `docs/ARCHITECTURE.md`. Los
  seis juegos (Burbujas, Colores mágicos, Sigue la luz, Toca y escucha,
  Ondas calmantes, Dibujo sensorial), sin puntuación obligatoria, más
  ajustes sensoriales por perfil (Modo Adulto, vía PIN). Cubre lo
  originalmente planeado para las Fases 6-7.
- [x] ~~Fase 6 — Primer juego sensorial~~ *(cubierta arriba)*.
- [x] ~~Fase 7 — Resto de juegos~~ *(cubierta arriba)*.
- [ ] Fase 8 — Modo adulto y controles (PIN).
- [ ] Fase 9 — Almacenamiento offline.
- [ ] Fase 10 — Diseño definitivo.
- [ ] Fase 11 — Accesibilidad y pruebas.
- [ ] Fase 12 — Preparación del Android App Bundle (.aab) para Google Play.
