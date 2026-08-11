# media

Almacenamiento local persistente de archivos (v0.2).

- `localFiles.ts`: copia fotos (perfil y tarjetas) y audios grabados a
  `Paths.document` (privado de la app, no se borra por presión de espacio
  como sí puede pasar con la caché temporal de `expo-image-picker`/la
  grabación), usando `expo-file-system`. Expone `persistLocalFile` y
  `deleteLocalFile`, usados por `features/profiles` y
  `features/aac-communicator` para que las fotos y audios elegidos por un
  adulto sobrevivan al cierre de la app.

**DATOS LOCALES ÚNICAMENTE**: nada de lo que pasa por este módulo se sube
a un servidor; todo queda en el almacenamiento privado del dispositivo.
