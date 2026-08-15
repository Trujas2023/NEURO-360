import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minTouchTarget, radius, spacing, typography } from '@shared/theme';

import type { AppIconName } from './AppIcon';
import { AppIcon } from './AppIcon';

export type BigButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface BigButtonProps {
  label: string;
  onPress: () => void;
  emoji?: string;
  /** Ícono de interfaz (R1); se usa en vez de `emoji` cuando el botón es un control, no vocabulario AAC. */
  icon?: AppIconName;
  variant?: BigButtonVariant;
  disabled?: boolean;
  /** Reemplaza el contenido por un indicador de carga y bloquea el toque, sin cambiar el tamaño del botón. */
  loading?: boolean;
  /** Estado "seleccionado" (p. ej. un filtro o una opción activa entre varias). */
  selected?: boolean;
  accessibilityHint?: string;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<BigButtonVariant, { background: string; text: string }> = {
  primary: { background: colors.primary, text: colors.onPrimary },
  secondary: { background: colors.surface, text: colors.textPrimary },
  ghost: { background: 'transparent', text: colors.textSecondary },
  danger: { background: colors.danger, text: colors.onPrimary },
};

/**
 * Botón grande y de área táctil amplia, pensado para niños neurodivergentes:
 * texto claro, contraste suficiente y sin animaciones agresivas. Estados de
 * interacción cubiertos (R1, ver docs/UX_UI_SYSTEM_SPEC.md §2-3): normal,
 * pressed (opacidad), selected (borde de foco), disabled (opacidad +
 * `accessibilityState`), loading (spinner en vez de contenido).
 */
export function BigButton({
  label,
  onPress,
  emoji,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  selected = false,
  accessibilityHint,
  fullWidth = true,
}: BigButtonProps) {
  const palette = VARIANT_STYLES[variant];
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, selected, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.background,
          borderColor: selected
            ? colors.focusRing
            : variant === 'secondary'
              ? colors.border
              : 'transparent',
          borderWidth: selected ? 2 : variant === 'secondary' ? 1 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'center',
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {icon ? <AppIcon name={icon} size={22} color={palette.text} /> : null}
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
    gap: spacing.sm,
  },
  emoji: {
    fontSize: typography.sizes.lg,
  },
  label: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
});
