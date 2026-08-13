import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@shared/theme';

export interface ScreenContainerProps {
  children: ReactNode;
  /** Centra el contenido verticalmente; útil para pantallas cortas como Bienvenida. */
  centered?: boolean;
  scrollable?: boolean;
  /**
   * Aplicar el margen seguro superior. Por defecto `true`; se pasa
   * `false` en las pantallas de `MainTabs` (Inicio/Mi Voz/Calma/Mi Día),
   * porque `MainTabHeader` ya reserva ese espacio arriba y duplicarlo
   * dejaría un salto vacío entre el encabezado y el contenido.
   */
  topInset?: boolean;
}

/** Fondo y márgenes consistentes para todas las pantallas de la app. */
export function ScreenContainer({
  children,
  centered = false,
  scrollable = false,
  topInset = true,
}: ScreenContainerProps) {
  const content = (
    <View style={[styles.content, centered && styles.centered]}>{children}</View>
  );
  const edges: ('top' | 'bottom' | 'left' | 'right')[] = topInset
    ? ['top', 'bottom', 'left', 'right']
    : ['bottom', 'left', 'right'];

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
