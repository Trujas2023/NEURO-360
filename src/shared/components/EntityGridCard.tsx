import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, touchTargets, typography } from '@shared/theme';

export interface EntityGridCardProps {
  emoji: string;
  label: string;
  /** Texto secundario opcional, hasta 2 líneas (p. ej. la descripción de un juego). */
  description?: string;
  /** Color de acento del borde; distingue entidades dentro de la misma grilla. */
  accentColor: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  /** Texto corto opcional en la esquina, p. ej. "3/5 pasos hechos". */
  badge?: string;
}

/**
 * Tarjeta de grilla compartida (Fase 7C, Design System). Reemplaza el
 * patrón `card`/`emoji`/`label` casi idéntico que `SensoryHomeScreen`,
 * `GamesHomeScreen`, `MyDayScreen` y `AacHomeScreen` reimplementaban cada
 * una por su cuenta (ver `docs/V7_PRODUCT_AUDIT.md` §7.7). Sin lógica de
 * navegación propia: quien la usa decide a dónde lleva `onPress`.
 */
export function EntityGridCard({
  emoji,
  label,
  description,
  accentColor,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  badge,
}: EntityGridCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.card, shadows.sm, { borderColor: accentColor, opacity: pressed ? 0.85 : 1 }]}
    >
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {badge}
          </Text>
        </View>
      ) : null}
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      {description ? (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    minHeight: touchTargets.large,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    maxWidth: '90%',
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  emoji: {
    fontSize: 40,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    marginTop: 2,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
