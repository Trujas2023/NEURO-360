import { useFonts } from 'expo-font';

/**
 * Carga Atkinson Hyperlegible (assets/fonts) antes de renderizar cualquier
 * pantalla de producto. Mientras `loaded` es `false`, React Native usa la
 * fuente del sistema como fallback silencioso (no hay error visible), pero
 * `RootApp` espera a `loaded` para evitar un "salto" de tipografía visible.
 */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    'AtkinsonHyperlegible-Regular': require('@assets/fonts/AtkinsonHyperlegible-Regular.ttf'),
    'AtkinsonHyperlegible-Bold': require('@assets/fonts/AtkinsonHyperlegible-Bold.ttf'),
  });
  return loaded;
}
