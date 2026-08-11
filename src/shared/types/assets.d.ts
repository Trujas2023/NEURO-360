/**
 * Declaración ambiental para poder `import`/`require` archivos de audio
 * empaquetados localmente (Metro los resuelve a un id de módulo numérico
 * en tiempo de compilación, igual que hace con imágenes).
 */
declare module '*.wav' {
  const assetId: number;
  export default assetId;
}
