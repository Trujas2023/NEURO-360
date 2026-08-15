# Mi Voz — refinamiento (Fase 7E)

**Estado:** tercera fase de V7 con código real. Alcance exacto asignado a
7E por `docs/V7_UX_ARCHITECTURE.md`: adoptar `EntityGridCard` en pantallas
de Mi Voz **si aplica**, y reestructurar la fila de acciones de
`AacManagerScreen` (fila §3 del documento de arquitectura, criterio de
"facilidad de uso" de la rúbrica). No toca `android.package`,
`ios.bundleIdentifier`, `versionCode` ni configuración EAS.

---

## 1. `EntityGridCard` en Mi Voz — evaluado, no adoptado (con motivo)

Mi Voz tiene dos componentes de tarjeta, ambos revisados antes de decidir:

- **`CategoryTile`** (grilla de categorías en `AacHomeScreen`): tarjeta de
  **color sólido** (`backgroundColor: category.color`), no una tarjeta
  blanca con borde de acento. Es un patrón deliberadamente distinto al que
  `EntityGridCard` reemplazó en 7C (el de `SensoryHomeScreen`/
  `GamesHomeScreen`/`MyDayScreen`, que sí eran casi idénticas entre sí —
  ver `docs/V7_PRODUCT_AUDIT.md` §7.7). Forzar `CategoryTile` a convertirse
  en `EntityGridCard` habría aplanado una distinción visual real del
  comunicador infantil (tarjetas de color pleno, más llamativas, pensadas
  para navegación de Modo Niño) sin ninguna razón de la rúbrica que lo
  pida — se decide **no adoptarlo acá**.
- **`AacCardTile`** (tarjetas de comunicación reales): tiene requisitos
  que `EntityGridCard` no cubre y no debería cubrir (ancho variable según
  `boardSize` del perfil, 3 flags independientes de qué mostrar,
  indicador de favorito, tamaño de texto configurable, foto vía
  `AacCardVisual`, barra de acento arriba en vez de borde completo).
  Ampliar `EntityGridCard` con todo esto lo convertiría en un componente
  específico de AAC, contrario a su propósito de tarjeta genérica
  compartida. **No se adopta acá tampoco.**

Ninguna de las dos decisiones es "trabajo pendiente" — son evaluaciones
completas con motivo documentado, no una casilla sin marcar.

---

## 2. `AacManagerScreen` — fila de acciones reestructurada

**Problema** (`docs/V7_PRODUCT_AUDIT.md` §6.9, §3 fila 8): cada tarjeta en
gestión mostraba 5 controles siempre visibles (favorito, mover arriba,
mover abajo, Editar, Eliminar), la fila de mayor densidad de toda la app.
El objetivo táctil de esos controles ya se había corregido a 48dp en 7C;
lo que quedaba pendiente era la densidad en sí.

**Cambio:** de 5 controles a 2 por tarjeta:
- **⭐ Favorito** — toque único, se queda visible: es la acción más
  frecuente de curar un tablero AAC.
- **⋮ Más acciones** — abre Mover arriba / Mover abajo / Editar / Eliminar
  (solo las que aplican: "Mover arriba" no aparece en la primera tarjeta
  de la categoría, "Mover abajo" no aparece en la última — misma lógica
  que antes tenían los botones deshabilitados, ahora expresada como
  ausencia del ítem en vez de un botón atenuado).

**Consistencia con el resto de la app, no un patrón nuevo aislado:** el
menú "Más acciones" reusa exactamente el mismo mecanismo que
`AdultCenterScreen` ya usa para "Mi Voz → Tarjetas/Ajustes" (7D):
`ActionSheetIOS` en iOS, `Alert.alert` con varios botones en Android — sin
ninguna dependencia nueva. Ningún comportamiento de guardado, orden o
eliminación cambió: `toggleFavorite`, `moveCard`, `deleteCard` y la
navegación a `AacCardForm` se llaman exactamente igual que antes.

**Iconografía:** los controles restantes pasan de texto plano
(⭐/☆/↑/↓) a Ionicons (`star`/`star-outline`/`ellipsis-vertical`), en
`textPrimary` — mismo convenio que el resto de la app desde 7C/7D.

---

## 3. Archivos modificados

`src/features/aac-communicator/screens/AacManagerScreen.tsx` — único
archivo tocado en esta fase.

---

## 4. Qué funciona

- Favoritos, reordenar, editar y eliminar tarjetas: mismo comportamiento
  de siempre, con menos controles visibles a la vez.
- El menú "Más acciones" respeta la posición real de la tarjeta (no
  ofrece mover más allá de los límites de su categoría).
- `npx tsc --noEmit` y `npx eslint .`: sin errores ni warnings.

## 5. Qué queda pendiente (fases futuras)

- Nada específico de Mi Voz queda pendiente del alcance de 7E — el resto
  del sistema (`AacHomeScreen`, `AacCardFormScreen`, `AacSettingsScreen`,
  `AacCategoryScreen`) ya estaba en veredicto "Mantener" desde 7B y no
  necesita reestructuración, solo el Design System que 7C ya les aplicó.
- Verificación visual en dispositivo real — 7J.

---

## Cierre de Fase 7E

`npx tsc --noEmit` y `npx eslint .` sin errores. No se tocó
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS. Detenido aquí, a la espera de autorización para iniciar la Fase 7F.
