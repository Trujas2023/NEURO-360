const { withAndroidManifest, createRunOncePlugin } = require('expo/config-plugins');

/**
 * `expo-file-system` trae consigo, a nivel de su módulo nativo de
 * Android (no de un plugin de configuración declarado en app.json),
 * READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE e INTERNET. Se
 * comprobó con `expo prebuild` real que filtrar el arreglo de permisos
 * o editar el manifiesto generado no alcanza: esos tres permisos se
 * fusionan desde el manifiesto propio del módulo nativo en un paso de
 * autolinking posterior a los plugins.
 *
 * La app solo usa el directorio de documentos privado (grabaciones de
 * voz de "Mi Voz"), que en Android moderno no necesita almacenamiento
 * externo, y no hace ninguna llamada de red: ninguno de los tres
 * corresponde a algo que la app realmente haga.
 *
 * La forma correcta de anular un permiso que aporta una librería es la
 * que define el propio sistema de fusión de manifiestos de Android:
 * declararlo en el manifiesto de la app con `tools:node="remove"`. A
 * diferencia de editar o filtrar, agregar una entrada nueva sí
 * sobrevive al merge (comprobado con `expo prebuild`).
 *
 * Importante: si en el futuro se agrega una función que sí necesite
 * alguno de estos permisos (compartir un archivo con otra app, o
 * cualquier llamada de red), hay que sacar esa entrada de acá.
 */
const UNUSED_PERMISSIONS = [
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.INTERNET',
];

function withoutUnusedPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.$['xmlns:tools'] = manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';

    if (!Array.isArray(manifest['uses-permission'])) {
      manifest['uses-permission'] = [];
    }

    for (const permission of UNUSED_PERMISSIONS) {
      const alreadyMarked = manifest['uses-permission'].some(
        (entry) => entry?.$?.['android:name'] === permission && entry?.$?.['tools:node'] === 'remove',
      );
      if (!alreadyMarked) {
        manifest['uses-permission'].push({
          $: { 'android:name': permission, 'tools:node': 'remove' },
        });
      }
    }

    return config;
  });
}

module.exports = createRunOncePlugin(withoutUnusedPermissions, 'withoutUnusedPermissions', '1.0.0');
