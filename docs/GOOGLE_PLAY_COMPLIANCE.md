# Notas de cumplimiento — Google Play (apps dirigidas a niños)

Estas notas registran las decisiones arquitectónicas tomadas desde la
Fase 1 para facilitar el cumplimiento de las políticas de Google Play para
contenido infantil / Designed for Families, y los puntos que quedan
pendientes de verificar/completar en fases posteriores. No sustituyen la
lectura de la política vigente de Google Play al momento de publicar
(Fase 12): las políticas y los requisitos de target API cambian con el
tiempo y deben reconfirmarse antes de enviar la app a revisión.

## Decisiones ya tomadas en la arquitectura

- **Sin publicidad ni SDKs de terceros con fines publicitarios**: no se
  instalará ningún SDK de ads, analítica de comportamiento o atribución.
- **Sin recopilación de datos innecesaria**: no hay ubicación, contactos,
  red social ni chat. El acceso a cámara/galería/micrófono es: la foto de
  avatar del perfil infantil (Fase 2), la fotografía opcional de las
  tarjetas del comunicador (Fase 3) y, desde v0.2, la grabación de voz
  personalizada por tarjeta (`expo-audio`). En todos los casos es:
  - iniciado explícitamente por un adulto, solo alcanzable dentro de Modo
    Adulto (protegido por PIN desde la Fase 2),
  - almacenado únicamente en el dispositivo, en un directorio propio de
    la app (`services/media/localFiles.ts`, sobre `expo-file-system`,
    v0.2) — no en la caché temporal del picker/grabación, que el sistema
    operativo podría liberar; las tarjetas y sus fotos/audios además
    quedan aisladas por perfil, nunca se mezclan entre niños,
  - sin subida a servidores propios ni de terceros.
  El texto a voz (`expo-speech`) se ejecuta localmente en el dispositivo,
  sin servicio externo.
- **`android.permissions` en `app.json` se mantiene vacío**; los permisos
  de cámara/galería/micrófono los agregan automáticamente los config
  plugins de `expo-image-picker` y `expo-audio` (declarados en
  `app.json`, este último con grabación/reproducción en segundo plano
  deshabilitadas por no ser necesarias) al generar el proyecto nativo,
  sin permisos adicionales declarados a mano.
- **PIN de Modo Adulto (Fase 2)**: es una barrera parental (fricción para
  evitar que un niño entre por accidente a la configuración o cree/edite
  perfiles), no un mecanismo de seguridad criptográfica; se guarda en el
  almacenamiento local igual que el resto de los datos offline-first.
- **Target/compile SDK fijados explícitamente** vía el plugin
  `expo-build-properties` en `app.json` (`compileSdkVersion`,
  `targetSdkVersion` = 36, `minSdkVersion` = 24), para no depender del
  valor por defecto de la versión de Expo usada. **Antes de la Fase 12**
  hay que verificar cuál es el target API mínimo exigido por Google Play
  en la fecha real de publicación y ajustar este valor si corresponde.
- **Sin enlaces externos ni compras dentro de la app** planificados; si en
  el futuro se agregara algo similar, debe evaluarse contra la política de
  Anuncios y Compras de Families antes de implementarse.
- **Fase 2 (Mundo Sensorial)**: los seis juegos sensoriales son 100% locales
  y no agregan permisos nuevos. Las dos dependencias incorporadas,
  `react-native-svg` (dibujo vectorial en pantalla) y `expo-haptics`
  (vibración corta opcional), no acceden a red, cámara, micrófono ni
  almacenamiento externo — no requieren entrada en `app.json.plugins` ni
  cambian el permiso alguno. Los sonidos de "Toca y escucha" y el "pop"
  de Burbujas reutilizan el motor de texto a voz local (`expo-speech`),
  ya declarado en el punto anterior; no hay archivos de audio nuevos ni
  llamadas a servicios externos. Los ajustes sensoriales por perfil se
  guardan en `AsyncStorage`, igual que el resto de los datos offline-first,
  y se aíslan y eliminan por perfil (`profileDataRegistry`).

## Pendiente para fases posteriores

- **Fase 8 (Modo adulto)**: la pantalla de Modo Adulto (protegida por PIN
  desde la Fase 2) es también el lugar natural para exponer, cuando
  corresponda, enlaces a política de privacidad y ajustes de datos, como
  exige la Data Safety section de Play Console.
- **Fase 9 (almacenamiento offline)**: perfiles, vocabulario, fotos y
  audios ya persisten localmente desde la Fase 2/v0.2
  (`services/storage`, `services/media`); falta formalizar el resto de
  esa fase (si corresponde) y usar esto como base para completar el
  formulario de Seguridad de los Datos de Play Console.
- **Fase 11 (accesibilidad y pruebas)**: validar tamaños de toque, contraste
  y navegación con lector de pantalla, requisitos de accesibilidad además
  de las políticas específicas de contenido infantil.
- **Fase 12 (AAB)**: completar el formulario de clasificación de contenido,
  la Data Safety section, la política de privacidad pública, y confirmar
  la categoría de audiencia (apta para niños) en Play Console antes de
  enviar a revisión.
