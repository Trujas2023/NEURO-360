import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@shared/theme';

import type { EmptyStateProps } from './EmptyState';
import { EmptyState } from './EmptyState';
import type { ErrorStateProps } from './ErrorState';
import { ErrorState } from './ErrorState';

export interface ScreenContainerProps {
  children: ReactNode;
  /** Centra el contenido verticalmente; útil para pantallas cortas como Bienvenida. */
  centered?: boolean;
  scrollable?: boolean;
  /** Estado "carga" declarativo (R1): reemplaza `children` por un indicador centrado. */
  loading?: boolean;
  loadingLabel?: string;
  /** Estado "vacío" declarativo (R1): reemplaza `children` por `EmptyState`. */
  empty?: EmptyStateProps;
  /** Estado "error" declarativo (R1): reemplaza `children` por `ErrorState`. */
  error?: ErrorStateProps;
}

/**
 * Fondo y márgenes consistentes para todas las pantallas de la app.
 * Resuelve los 5 estados de pantalla obligatorios (R1, ver
 * docs/UX_UI_SYSTEM_SPEC.md §2): carga/error/vacío tienen prioridad
 * declarativa sobre `children` (contenido poblado); la confirmación se
 * resuelve aparte con `ConfirmDialog`.
 */
export function ScreenContainer({
  children,
  centered = false,
  scrollable = false,
  loading = false,
  loadingLabel,
  empty,
  error,
}: ScreenContainerProps) {
  let body: ReactNode = children;
  let forceCentered = centered;

  if (loading) {
    body = (
      <View style={styles.stateWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
        {loadingLabel ? <Text style={styles.loadingLabel}>{loadingLabel}</Text> : null}
      </View>
    );
    forceCentered = true;
  } else if (error) {
    body = <ErrorState {...error} />;
    forceCentered = true;
  } else if (empty) {
    body = <EmptyState {...empty} />;
    forceCentered = true;
  }

  const content = <View style={[styles.content, forceCentered && styles.centered]}>{body}</View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
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
  stateWrap: {
    alignItems: 'center',
  },
  loadingLabel: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
