# Release Candidate (Fase 7K)

**Estado:** novena y última fase planeada de V7
(`docs/V7_PRODUCT_AUDIT.md`, §12). Verificación final, confirmación de
identidad técnica, e incremento de `versionCode` — recién acá, como
exigía la Regla 4 desde el inicio de V7 ("no incrementar hasta que QA
pase"). El build AAB de validación queda bloqueado por autenticación,
documentado en detalle en §4.

---

## 1. Verificación final

- `npx tsc --noEmit`: sin errores.
- `npx eslint .`: sin errores ni warnings.
- `npx expo config --type public`: resuelve sin errores; `sdkVersion:
  '57.0.0'`, `android.package`/`ios.bundleIdentifier`
  `com.senseplayadventures.app` en ambas plataformas, tal como antes de
  V7.

## 2. Confirmación de identidad técnica

Verificado con `expo prebuild --platform android --no-install` local
(directorio `android/` gitignored, se generó y se descartó solo para
esta comprobación, no queda en el repo):

- `applicationId 'com.senseplayadventures.app'` — sin cambios.
- Permisos de `AndroidManifest.xml` — exactamente los mismos que en el
  último prebuild de verificación de 7H/7I (`RECORD_AUDIO`,
  `MODIFY_AUDIO_SETTINGS`, `INTERNET`, `SYSTEM_ALERT_WINDOW`, `VIBRATE`,
  `READ/WRITE_EXTERNAL_STORAGE` con `maxSdkVersion=32` — todos ya
  existentes antes de V7, ninguno nuevo).
- `eas.json`: sin cambios en ningún perfil (`development`/`preview`/
  `production`), `appVersionSource: "local"` sigue así — el
  `versionCode` se lee de `app.json`, no se autoincrementa.
- `git diff app.json` (ver §3): el único campo modificado es
  `android.versionCode`. `ios.bundleIdentifier` y `android.package`
  intactos en las 10 fases de V7 (7A–7K), tal como exigía la Regla 4.

## 3. `versionCode`: 5 → 6

Único cambio de identidad de esta fase, y el único autorizado por la
Regla 4 ("no antes de que QA pase" — 7J cerró la auditoría de
accesibilidad y objetivo táctil sin encontrar nada por corregir, ver
`docs/V7_QA_ACCESSIBILITY.md`). `version` (semver, `0.1.0`) se deja sin
tocar: nadie pidió un cambio de versión visible al usuario, solo del
identificador interno de build que Google Play exige que sea mayor en
cada subida.

`docs/QA_ANDROID_INTERNAL_TESTING.md` actualizado para reflejar el build
a probar (`versionCode 6`) y su título ya no dice "V2 Fases 0–6" a secas
— el documento se extendió activamente en 7H/7I/7J y sigue vigente para
V7.

## 4. Build AAB de validación — bloqueado por autenticación

`npx eas-cli build --platform android --profile production
--non-interactive` fallla con:

```
An Expo user account is required to proceed.
Either log in with eas login or set the EXPO_TOKEN environment variable
if you're using EAS CLI on CI
```

Es el mismo bloqueo ya diagnosticado antes del inicio de V7 (no es un
problema nuevo de esta fase, ni de ninguna decisión tomada en 7A–7J): el
entorno no tiene una sesión de cuenta Expo autenticada, y la variable
`EXPO_TOKEN` no está configurada. **No es algo que se pueda resolver
desde el código del repositorio** — es credenciales de cuenta, fuera del
alcance de cualquier fase de V7.

**Para desbloquear:** configurar `EXPO_TOKEN` como variable de entorno a
nivel del entorno de ejecución (no pegarlo en el chat, es un secreto) —
un token de acceso se genera en https://expo.dev/accounts/[cuenta]/settings/access-tokens.
Una sesión ya en marcha no recoge variables de entorno nuevas: hace falta
una sesión nueva después de configurarlo. Con `EXPO_TOKEN` presente, el
mismo comando de arriba debería completar el build sin ningún otro
cambio.

Todo lo demás de 7K —código, configuración, identidad técnica— está
listo para ese build en el momento en que la autenticación se resuelva.

---

## 5. Archivos modificados

- `app.json`: `android.versionCode` 5 → 6 (único cambio).
- `docs/QA_ANDROID_INTERNAL_TESTING.md`: título y build de referencia
  actualizados.
- `docs/V7_RELEASE_CANDIDATE.md` (este documento).

---

## 6. Qué funciona

- Todo el código de V7 (Fases 7C–7J): validado, `tsc`/`eslint` limpios en
  cada cierre de fase, sin deuda pendiente de esas verificaciones.
- Identidad técnica: confirmada intacta en las 10 fases de V7.
- `versionCode` incrementado correctamente, en el momento correcto (tras
  QA, no antes).

## 7. Qué queda pendiente (fuera del alcance de código de V7)

- **Build AAB real**: bloqueado por `EXPO_TOKEN` ausente (§4) — acción
  del usuario, no de código.
- **QA en dispositivo real** (TalkBack + tablet, checklist de 7J en
  `docs/QA_ANDROID_INTERNAL_TESTING.md` §18/§23): este entorno no tiene
  el hardware.
- **Alto contraste**: sigue sin una paleta alternativa en el Design
  System (señalado desde 7H, sin decisión de diseño todavía).

---

## Cierre de Fase 7K — y del plan original de V7

`docs/V7_PRODUCT_AUDIT.md` (7A, §12) planificó V7 en fases 7A–7K; esta es
la última. El código de las 4 fases (Mi Voz, Mundo Sensorial, Calma 360,
Modo Adulto) y el Design System están completos y validados según la
Regla 6 (abre, funciona, persiste, sobrevive reinicio, estados visuales
correctos, no rompe navegación). Lo que falta para un release real —
build AAB, QA con TalkBack en dispositivo físico— depende de acciones
fuera de este repositorio (credenciales de cuenta, hardware), no de
trabajo de código pendiente.

`npx tsc --noEmit` y `npx eslint .` sin errores. No se tocó
`android.package` ni `ios.bundleIdentifier`; `versionCode` incrementado
de forma explícita y autorizada. Detenido aquí, a la espera de tu
confirmación de qué sigue — si hay algo más para construir en V7 que no
esté en el plan original de 7A, decilo explícitamente; si no, el
siguiente paso natural es configurar `EXPO_TOKEN` para poder correr el
build real.
