import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minTouchTarget, radius, spacing, typography } from '@shared/theme';

export type BigButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface BigButtonProps {
  label: string;
  onPress: () => void;
  emoji?: string;
  variant?: BigButtonVariant;
  disabled?: boolean;
  /** Reemplaza el contenido por un indicador de carga y bloquea el toque, sin cambiar el tamaño del botón. */
  loading?: boolean;
  accessibilityHint?: string;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<BigButtonVariant, { background: string; text: string }> = {
  // Texto oscuro sobre los dos fondos pasteles: contraste WCAG AA real
  // (~5:1 y ~4.5:1); texto blanco sobre estos tonos no llega a 3:1.
  primary: { background: colors.primary, text: colors.textPrimary },
  secondary: { background: colors.surface, text: colors.textPrimary },
  ghost: { background: 'transparent', text: colors.textSecondary },
  danger: { background: colors.danger, text: colors.textPrimary },
};

/**
 * Botón grande y de área táctil amplia, pensado para niños neurodivergentes:
 * texto claro, contraste suficiente y sin animaciones agresivas.
 */
export function BigButton({
  label,
  onPress,
  emoji,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityHint,
  fullWidth = true,
}: BigButtonProps) {
  const palette = VARIANT_STYLES[variant];
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.background,
          borderColor: variant === 'secondary' ? colors.border : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: !isInteractive ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'center',
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
          <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: typography.sizes.lg,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
});
