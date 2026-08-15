# Calma 360 — "Necesito un descanso" (Fase 7G)

**Estado:** quinta fase de V7 con código real. Alcance exacto asignado a
7G por `docs/V7_UX_ARCHITECTURE.md` §12: botón "Necesito un descanso" +
sonidos relajantes propios de Calma. No toca `android.package`,
`ios.bundleIdentifier`, `versionCode` ni configuración EAS.

---

## 1. "Necesito un descanso" (`CalmRestScreen`)

Botón nuevo en `CalmCommunicationScreen` ("😴 Necesito un descanso"),
junto al ya existente "Ir a Mundo Sensorial". Un toque abre la pantalla
directo — sin preguntas previas ni árbol de decisión, tal como especificó
7B: un descanso no necesita que el niño elija nada para empezar a
funcionar.

Dentro de la pantalla sí hay dos elecciones **opcionales**:
- **Duración**: 1 / 2 / 5 minutos (por defecto 2).
- **Sonido de fondo**: Silencio / Sonido suave / Brisa (por defecto
  Silencio) — oculto por completo si el perfil tiene el sonido apagado
  (`soundEnabled`), igual que el resto de la app.

El temporizador visual **reutiliza `VisualTimer` de `daily-routine` tal
cual** (mismo componente, sin fork ni copia): ya era genérico —
`durationSeconds` + `reduceMotion`, sin ninguna dependencia del concepto
de "rutina" — así que no hacía falta reconstruirlo, solo importarlo. Trae
sus propios botones Empezar/Pausa/Reiniciar.

---

## 2. Sonidos relajantes — mismo criterio de licencia que 7F

"Sonido suave" y "Brisa" son **tonos sintetizados por código**, no
grabaciones:
- `calm_pad.wav`: un acorde grave de dos tonos (Do3 + Sol3) con una
  ondulación lenta de volumen ("respiración").
- `calm_breeze.wav`: ruido marrón (integración con fuga de ruido blanco,
  técnica estándar para simular viento/brisa suave).

Ambos de 10 segundos, con entrada y salida en silencio total (envolvente
de coseno elevado) para que el bucle (`player.loop = true`) no tenga
ninguna costura audible al repetirse. Igual que en 7F: no hay ninguna obra
de terceros involucrada, así que no hay ninguna licencia que verificar —
mismo principio, aplicado a un timbre distinto (grave y sostenido en vez
del timbre de campana de "Sonidos y ritmo").

---

## 3. Detalle técnico: mutar `player.loop`

`expo-audio` no ofrece una opción del hook `useAudioPlayer` para activar
el loop al crear el reproductor — es una propiedad mutable de la
instancia (`player.loop = true`), y una regla de lint del proyecto
(`react-hooks/immutability`) marca por defecto cualquier mutación de un
valor devuelto por un hook como sospechosa. Se documentó explícitamente
por qué es segura acá (es una propiedad del módulo nativo, no estado de
React) y se acotó la excepción a ese bloque exacto, en vez de desactivar
la regla en todo el archivo.

---

## 4. Archivos modificados/creados

**Nuevos:** `assets/sounds/calm_pad.wav`, `assets/sounds/calm_breeze.wav`
(1.7 MB en total), `src/features/calm/screens/CalmRestScreen.tsx`.

**Modificados:** `src/features/calm/screens/CalmCommunicationScreen.tsx`,
`src/app/navigation/types.ts`, `src/app/navigation/RootNavigator.tsx`,
`src/features/calm/README.md`, `docs/QA_ANDROID_INTERNAL_TESTING.md`.

---

## 5. Qué funciona

- "Necesito un descanso" alcanzable en 1 toque desde Calma.
- Duración y sonido configurables sin bloquear el inicio del descanso.
- El sonido elegido reemplaza al anterior sin superponerse (mismo
  principio de "nunca dos audios a la vez" ya aplicado en Mi Voz).
- Funciona sin conexión (los sonidos están bundleados en la app).
- `npx tsc --noEmit` y `npx eslint .`: sin errores ni warnings.

## 6. Qué queda pendiente

- Ninguna función de Calma queda pendiente del alcance de 7G. El resto
  del módulo (`CalmCommunicationScreen`, `PainFlowScreen`,
  `OverwhelmFlowScreen`) ya estaba en veredicto "Mantener" desde 7B.
- Verificación de audio en dispositivo real — 7J.

---

## Cierre de Fase 7G

`npx tsc --noEmit` y `npx eslint .` sin errores. No se tocó
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS. Detenido aquí, a la espera de autorización para iniciar la Fase 7H.
