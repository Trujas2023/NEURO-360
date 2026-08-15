import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@shared/theme';

export interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: string;
  action?: ReactNode;
}

/**
 * Estado "vacío" consistente (R1, ver docs/UX_UI_SYSTEM_SPEC.md §1.6, §2).
 * Reemplaza el texto suelto que cada pantalla definía por su cuenta (Mi
 * Voz, Mi Día, Perfiles, Modo Adulto tenían cada uno su propio
 * `styles.empty` casi idéntico).
 */
export function EmptyState({ emoji = '📭', title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
});
