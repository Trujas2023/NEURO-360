# Matriz de Aceptación Funcional — 100% del producto

**Estado:** ESPECIFICACIÓN CERRADA para aprobación. Tabla de referencia única para verificar el cierre de cada fase (`docs/REBUILD_ROADMAP_R1_R10.md`) y cada funcionalidad (`docs/DEFINITION_OF_DONE.md`).

## Leyenda

- **ESTADO ACTUAL**: clasificación de `docs/POST_V7_PRODUCT_GAP_ANALYSIS.md` (REALMENTE FUNCIONAL / PARCIAL / SIMULADO / PLACEHOLDER / NO IMPLEMENTADO / UX DEFICIENTE) para lo que ya existe; para funciones enteramente nuevas, se indica **No implementado** por definición.
- **FASE**: dónde se construye o se cierra, según `docs/REBUILD_ROADMAP_R1_R10.md`. "—" significa que ya cumple su DONE hoy y solo se migra de infraestructura sin cambio de comportamiento (ver columna Fase igual indicando la fase de migración técnica cuando aplica).
- **PRIORIDAD**: P0 (bloquea una versión comercial creíble), P1 (calidad/accesibilidad comercial), P2 (mejora, no bloquea) — mismos criterios de `POST_V7_PRODUCT_GAP_ANALYSIS.md` §12. Las filas ya funcionales llevan la prioridad de **no regresionar**, no de construir desde cero.
- **CRITERIO DONE**: versión abreviada; el detalle completo (flujo, datos, edge cases, prueba manual) vive en `docs/DEFINITION_OF_DONE.md`.

---

## 1. Home / Navegación

| Función | Estado actual | Objetivo | Fase | Prioridad | Criterio DONE (resumen) |
|---|---|---|---|---|---|
| Bienvenida → selector de perfil | Realmente funcional | Mantener, migrar a design system nuevo | R9 | P1 | Flujo idéntico, visual actualizado |
| Home: grilla de 4 pilares con igual jerarquía | UX deficiente (hoy: lista de 3 botones desigual) | Rediseño completo | R9 | P0 | Los 4 pilares con igual peso visual, ver `PRODUCT_MASTER_SPEC.md` §1.2 |
| Barra universal Inicio/Calma | No implementado | Presente y funcional en 100% de pantallas de Modo Niño | R1 (shell) → R9 (integración) | P0 | Verificado en cada pantalla, sin excepción, ver `DEFINITION_OF_DONE.md` §7.1 |
| Cambio de perfil | Realmente funcional | Mover a ícono en franja superior de Home | R9 | P2 | Accesible en 1 toque desde Home |
| Separación Modo Niño / Modo Adulto (regla de arquitectura) | Realmente funcional | Mantener como regla no negociable para todo código nuevo | R1 | P0 | Cero imports cruzados verificados en cada PR |
| Retorno seguro a Home (2 salidas por pantalla) | No implementado | Volver + Inicio en toda pantalla de Modo Niño | R9 | P0 | Ninguna pantalla requiere >1 toque para llegar a Home |
| Responsive tablet/teléfono (columnas) | No implementado | `useResponsiveColumns` aplicado a toda grilla | R1 | P1 | Verificado en tablet y teléfono, portrait y landscape |
| Orientación portrait/landscape | No implementado (bloqueado a portrait) | Habilitar `orientation: default` tras validar pantalla por pantalla | R9 | P2 | Cambio de `app.json` ejecutado solo tras validación, tal como se especifica |
| Unificación de nombre "Mundo Sensorial" | UX deficiente (3 nombres distintos hoy) | Un solo nombre en UI y código | R9 | P1 | Cero apariciones de "Juega & Regula" en UI |
| Identidad visual / branding | Débil (evaluación cualitativa) | Nuevo sistema visual (`UX_UI_SYSTEM_SPEC.md`) | R1 / R9 | P2 | Checklist de `UX_UI_SYSTEM_SPEC.md` §6 cumplido |
| Decisión de nombre de marca | No resuelto (3 nombres en uso) | Un nombre único confirmado y aplicado | R1 | P1 | Requiere decisión explícita del usuario antes de ejecutar (`PRODUCT_MASTER_SPEC.md` §0.1) |

## 2. Mi Voz AAC

| Función | Estado actual | Objetivo | Fase | Prioridad | Criterio DONE (resumen) |
|---|---|---|---|---|---|
| Construcción de frases | Realmente funcional | Mantener | — (migra en R1) | P0 | Sin regresión tras migración de datos |
| TTS por defecto | Realmente funcional | Mantener + fallback de audio grabado | R2 | P0 | Sin regresión; fallback verificado |
| Categorías (23 + 3 virtuales) | Realmente funcional | Mantener, revisar cobertura Sí/No | R2 | P2 | Cobertura mínima de `PRODUCT_MASTER_SPEC.md` §2.2 |
| Sí/No como acceso de un toque | Parcial | Promover a acceso directo garantizado | R2 | P2 | Alcanzable en 1 toque desde `AacHomeScreen` |
| Pictogramas profesionales | Parcial / calidad insuficiente (emoji) | Set profesional (Mulberry Symbols) | R2 | P0 | Vocabulario semilla y núcleo usan pictogramas por defecto |
| Fotografías personalizadas | Realmente funcional | Mantener | — | P0 | Sin regresión |
| Alta/edición/eliminación de tarjetas | Realmente funcional | Mantener, migrar a SQLite | R1 / R2 | P0 | Misma API de hooks, sin regresión |
| Favoritos / Recientes / Más usados | Realmente funcional | Mantener | — | P0 | Sin regresión |
| Búsqueda | Realmente funcional | Mantener | — | P1 | Sin regresión |
| Vocabulario núcleo | Realmente funcional (no editable) | Mantener; edición desde UI queda fuera de alcance R1-R10 | — | P2 | Backlog futuro, no bloqueante |
| Grabación de voz familiar | No implementado | Implementar completo con `expo-audio` | R2 | P0 | Grabación sobrevive cierre/reapertura, ver DoD §2.2 |
| Reproducción de audio grabado (fallback TTS) | No implementado | Implementar | R2 | P0 | Orden audio→TTS verificado |
| Selector de idioma/voz TTS | No implementado | Implementar | R2 | P1 | Cambio verificado auditivamente y persistente |
| Contextos rápidos (Casa/Escuela/Terapia) | No implementado | Implementar | R2 | P2 | Reordena sin ocultar tarjetas |
| Perfiles múltiples con datos aislados | Realmente funcional | Mantener | — | P0 | Sin regresión |
| Persistencia de tarjetas AAC | Realmente funcional (con riesgo, ver §7) | Migrar a SQLite | R1 | P0 | Migración de datos existentes verificada |
| Personalización visual (tablero/texto/mostrar) | Realmente funcional | Mantener + columnas responsivas | R1 / R2 | P1 | Sin regresión + adaptación a tablet |

## 3. Mundo Sensorial

| Función | Estado actual | Objetivo | Fase | Prioridad | Criterio DONE (resumen) |
|---|---|---|---|---|---|
| Revienta Burbujas | No implementado (0%) | Juego jugable completo | R3 | P0 | Ver DoD §3.1, jugable 2+ min sin fallos |
| Sigue la Luz | No implementado (0%) | Juego jugable completo | R3 | P0 | Ver DoD §3.2, sin marcar "error" nunca |
| Colores y Formas | No implementado (0%) | Juego jugable completo | R3 | P0 | 3+ rondas sin temporizador de presión |
| Trazos Calmados | No implementado (0%) | Juego jugable completo | R3 | P0 | Lienzo fluido, "Limpiar" con confirmación |
| Clasificación Visual | No implementado (0%) | Juego jugable completo | R3 | P1 | Sin error terminal, adaptado a tablet |
| Ritmo Suave | No implementado (0%) | Juego jugable completo | R3 | P1 | Completable solo visualmente sin sonido |
| Configuración por juego (velocidad/densidad/colores) | No implementado | Implementar por perfil | R3 | P1 | Persistente por perfil y por juego |

*(El control de habilitar/deshabilitar Mundo Sensorial completo para un perfil no es una función propia de este módulo — es un caso de uso de "Habilitar/deshabilitar módulos por perfil", fila de la sección 6 Centro de Adultos. No se duplica aquí.)*

## 4. Calma 360

| Función | Estado actual | Objetivo | Fase | Prioridad | Criterio DONE (resumen) |
|---|---|---|---|---|---|
| Frases rápidas de emergencia | Realmente funcional | Mantener, reubicar como sub-sección | R4 | P0 | Sin regresión tras extracción de módulo |
| Acceso a Calma desde cualquier pantalla | UX deficiente (falso hoy pese al comentario del código) | Barra universal real | R4 / R9 | P0 | Verificado en 100% de pantallas de Modo Niño |
| Respiración visual guiada | No implementado | Implementar | R4 | P0 | Ciclo completo con temporización correcta, ver DoD §4.1 |
| Temporizador/cuenta regresiva de respiración | No implementado | Implementar | R4 | P0 | Fase actual anunciada también como texto |
| Pantalla de baja estimulación | No implementado | Implementar | R4 | P1 | Sin sonido/animación no solicitados |
| Sonidos calmantes + control de volumen | No implementado | Implementar | R4 | P1 | Cero audio fuera de la pantalla del módulo |
| Enlace a Mundo Sensorial desde Calma | Realmente funcional (apunta a stub hoy) | Apuntar a contenido real | R4 (depende R3) | P1 | Navega a un juego real, no a `ComingSoon` |

## 5. Mi Día / Rutinas

| Función | Estado actual | Objetivo | Fase | Prioridad | Criterio DONE (resumen) |
|---|---|---|---|---|---|
| CRUD de rutinas y pasos | Realmente funcional | Mantener, migrar a SQLite | R1 / R5 | P0 | Sin regresión |
| Indicador Primero/Después | Realmente funcional | Mantener | — | P1 | Sin regresión |
| Marcar paso hecho / progreso | Realmente funcional | Mantener | — | P0 | Sin regresión |
| Reinicio manual de rutina | Realmente funcional | Mantener | — | P2 | Sin regresión |
| Reinicio automático diario | No implementado | Implementar | R5 | P1 | Reinicio sin intervención al cambiar de día real, ver DoD §5.1 |
| Plantillas de franja horaria | No implementado | Implementar | R5 | P2 | Mañana/Escuela/Tarde/Noche disponibles y editables |
| Fotos/pictogramas por paso | Parcial (solo emoji) | Implementar | R5 | P2 | Persistente tras cierre/reapertura |
| Temporizador opcional por paso | No implementado | Implementar | R5 | P2 | Visual, no bloqueante |
| Recompensa visual opcional al completar | No implementado | Implementar | R5 | P2 | Configurable on/off por perfil |

## 6. Centro de Adultos

| Función | Estado actual | Objetivo | Fase | Prioridad | Criterio DONE (resumen) |
|---|---|---|---|---|---|
| PIN de acceso (crear/verificar) | Realmente funcional | Mantener + hash | R1 / R6 | P0 | Sin regresión + PIN ya no en texto plano |
| Recuperación de PIN (olvidado) | No implementado | Implementar | R6 | P0 | Nunca borra datos existentes, ver DoD §6.1 |
| Cambio voluntario de PIN (adulto ya autenticado) | No implementado | Implementar | R6 | P1 | Nuevo PIN activo de inmediato, sin afectar el código de recuperación previamente emitido salvo que se regenere explícitamente |
| Cerrar sesión de adulto | Realmente funcional (`AdultHomeScreen.tsx` "Salir de Modo Adulto") | Mantener | — | P2 | Vuelve a `ProfileSelector`, sin regresión |
| Gestión de perfiles | Realmente funcional | Mantener | — | P0 | Sin regresión |
| Edición de tarjetas AAC (Manager) | Realmente funcional | Mantener, extender pictograma/audio | R2 | P0 | Sin regresión + nuevos campos editables |
| Ajustes AAC por perfil | Realmente funcional | Mantener, extender idioma | R2 | P1 | Sin regresión |
| Administración de rutinas | Realmente funcional | Mantener, extender | R5 | P1 | Sin regresión |
| Ajustes de Mundo Sensorial por perfil | No implementado | Implementar | R6 (depende R3) | P1 | Persistente por perfil y por juego |
| Ajustes de Calma 360 por perfil | No implementado | Implementar | R6 (depende R4) | P2 | Preset de respiración y volumen máximo aplicados |
| Estadísticas de uso | No implementado | Implementar | R6 | P2 | Datos reales de uso, sin gamificación competitiva |
| Copia de seguridad: exportar | No implementado | Implementar | R7 | P0 | Archivo `.sp360backup` generado y compartible |
| Copia de seguridad: importar/restaurar | No implementado | Implementar | R7 | P0 | Ciclo exportar→borrar→importar recupera 100%, ver DoD §6.2 |
| Exportación por perfil | No implementado | Implementar | R7 | P2 | Un perfil exportable de forma aislada |
| Privacidad y datos (declaración) | No implementado | Implementar | R6 | P0 | Declaración completa visible offline |
| Eliminación total de datos | No implementado | Implementar | R6 | P0 | App queda como instalación nueva, ver DoD §6.3 |
| Acerca de / Soporte | No implementado | Implementar | R6 | P1 | Versión, changelog, contacto, créditos de pictogramas |
| Habilitar/deshabilitar módulos por perfil | No implementado | Implementar | R6 | P2 | Control efectivo, verificado en Modo Niño |

## 7. Datos y persistencia (transversal)

| Función | Estado actual | Objetivo | Fase | Prioridad | Criterio DONE (resumen) |
|---|---|---|---|---|---|
| Motor de persistencia (AsyncStorage → SQLite) | Riesgo alto (auditoría §8) | Migrar | R1 | P0 | Migración de datos reales sin pérdida, ver DoD §8.1 |
| Almacenamiento de medios (fotos/audio) como archivos | Parcial (solo fotos hoy) | Extender a audio, formalizar patrón | R1 / R2 | P0 | Archivos reales, rutas en BD, nunca blobs |
| Manejo de corrupción de datos | Simulado (silencioso, re-siembra sin avisar) | Visible al usuario | R1 / R7 | P1 | Error mostrado, nunca sobrescritura silenciosa |
| Hash de PIN | No implementado (texto plano) | Implementar | R1 | P1 | PIN nunca legible en texto plano en almacenamiento |

## 8. Accesibilidad (transversal)

| Función | Estado actual | Objetivo | Fase | Prioridad | Criterio DONE (resumen) |
|---|---|---|---|---|---|
| Área táctil mínima 64dp | Realmente funcional | Mantener en todo componente nuevo | Todas | P0 | Auditado en R8/R9 |
| `accessibilityLabel`/`Role`/`Hint` sistemático | Realmente funcional (contenido existente) | Extender a todo lo nuevo | R2-R8 | P0 | Cobertura 100% verificada en R8 |
| `reduceMotion` real | Simulado / placeholder | Efecto real en toda animación | R1 / R8 | P0 | Cero animación >instantánea con el ajuste activo, ver DoD §8.2 |
| Verificación con lector de pantalla (TalkBack) | No implementado (nunca ejecutado) | Ejecutar y corregir | R8 | P0 | Sesión completa sobre los 5 pilares sin elementos huérfanos |
| Contraste AA verificado | No implementado (no medido) | Medir y documentar | R8 | P1 | Tabla de verificación completa |
| Reducción de estímulos (`lowStimulationMode`) | No implementado | Implementar | R6 / R8 | P2 | Reduce densidad/paleta de forma verificable |

## 9. UX/UI — design system (transversal)

| Función | Estado actual | Objetivo | Fase | Prioridad | Criterio DONE (resumen) |
|---|---|---|---|---|---|
| Design system (tipografía, color, iconografía) | Parcial (tokens básicos, sin iconografía consistente) | Sistema completo | R1 | P0 | Checklist `UX_UI_SYSTEM_SPEC.md` §6 |
| Estados loading/empty/error/confirmación consistentes | Parcial (ad-hoc por pantalla) | Componentes compartidos | R1 | P1 | `EmptyState`/`ConfirmDialog`/`Toast` usados en toda pantalla |
| Hápticos | No implementado | Implementar | R1 | P2 | Feedback en interacciones clave, respeta toggle |
| Animaciones/microinteracciones | No implementado (sin librería) | Implementar con `Animated` | R1 / R3 / R4 | P2 | Presentes y coherentes con `reduceMotion` |

---

## Totales de esta matriz

*(Recalculado tras la corrección de la validación cruzada §I del resumen ejecutivo de aprobación: se retiró la fila duplicada de Mundo Sensorial y se agregaron "Cambio voluntario de PIN" y "Cerrar sesión de adulto", ausentes en la primera versión pese a estar nombradas en `PRODUCT_MASTER_SPEC.md` §6.2.)*

- **83 funciones** cubriendo el 100% de los 5 pilares + transversales (navegación, datos, accesibilidad, UX/UI).
- **Ya "Realmente funcional" hoy y se conserva** (con o sin migración técnica de infraestructura): 28 funciones (~34%).
- **Parcial / Simulado / UX deficiente / no resuelto, requiere trabajo real sobre una base existente**: 14 funciones (~17%).
- **No implementado por completo, requiere construcción desde cero**: 41 funciones (~49%).

Esto es consistente con el ~37-40% de cumplimiento funcional real estimado en `docs/POST_V7_PRODUCT_GAP_ANALYSIS.md` §13: alrededor de un tercio de las funciones que definen el producto completo ya están terminadas (con el matiz de que ese ~37-40% pondera las cuatro columnas de producto por igual en vez de contar funciones sueltas), y las dos terceras partes restantes (parciales + no implementadas) son el contenido real de R1-R10.
