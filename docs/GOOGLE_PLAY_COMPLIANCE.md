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
  red social ni chat. El único acceso a cámara/galería es la foto de
  avatar del perfil infantil (Fase 2) y, desde la Fase 3, la fotografía
  opcional de las tarjetas del comunicador (`expo-image-picker`, misma
  dependencia, sin instalar nada nuevo). En ambos casos es:
  - iniciado explícitamente por un adulto, solo alcanzable dentro de Modo
    Adulto (protegido por PIN desde la Fase 2),
  - almacenado únicamente en el dispositivo (offline-first; las tarjetas
    además quedan aisladas por perfil, nunca se mezclan entre niños),
  - sin subida a servidores propios ni de terceros.
  El mismo criterio aplicará a las grabaciones de voz personalizadas del
  comunicador (Fase 5). El texto a voz de la Fase 3 (`expo-speech`) se
  ejecuta localmente en el dispositivo, sin servicio externo.
- **`android.permissions` en `app.json` se mantiene vacío**; los permisos
  de cámara/galería los agrega automáticamente el config plugin de
  `expo-image-picker` (declarado en `app.json`) al generar el proyecto
  nativo, sin permisos adicionales declarados a mano.
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

## Pendiente para fases posteriores

- **Fase 8 (Modo adulto)**: la pantalla de Modo Adulto (protegida por PIN
  desde la Fase 2) es también el lugar natural para exponer, cuando
  corresponda, enlaces a política de privacidad y ajustes de datos, como
  exige la Data Safety section de Play Console.
- **Fase 9 (almacenamiento offline)**: documentar explícitamente qué datos
  se guardan (perfiles, vocabulario, fotos, audios) y confirmar que nada
  sale del dispositivo, como base para completar el formulario de
  Seguridad de los Datos de Play Console.
- **Fase 11 (accesibilidad y pruebas)**: validar tamaños de toque, contraste
  y navegación con lector de pantalla, requisitos de accesibilidad además
  de las políticas específicas de contenido infantil.
- **Fase 12 (AAB)**: completar el formulario de clasificación de contenido,
  la Data Safety section, la política de privacidad pública, y confirmar
  la categoría de audiencia (apta para niños) en Play Console antes de
  enviar a revisión.
