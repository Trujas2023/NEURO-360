import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@shared/theme';

import { AppIcon } from './AppIcon';
import { BigButton } from './BigButton';

export interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Estado "error" consistente (R1, ver docs/UX_UI_SYSTEM_SPEC.md §2, §5.7):
 * lenguaje simple, sin jerga técnica, con una acción de recuperación
 * clara. Antes de R1, la app prácticamente no tenía manejo de error
 * visible al usuario.
 */
export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Reintentar',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AppIcon name="alert-circle-outline" size={48} color={colors.danger} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? (
        <View style={styles.action}>
          <BigButton label={retryLabel} variant="secondary" fullWidth={false} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    marginTop: spacing.sm,
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
