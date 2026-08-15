import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, touchTargets, typography } from '@shared/theme';

export interface EntityGridCardProps {
  /**
   * Exactamente uno de `emoji`/`icon`. La mayoría del contenido (categorías,
   * juegos, rutinas, actividades) ya trae su propio `emoji: string`; las
   * secciones administrativas nuevas (Centro Adulto) no tienen ese dato y
   * usan un ícono vectorial (`@expo/vector-icons`, mismo convenio que la
   * barra inferior desde la Fase 7C) en su lugar.
   */
  emoji?: string;
  icon?: keyof typeof Ionicons.glyphMap;
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
  icon,
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
      {/* Ícono en textPrimary, no en accentColor: igual que los botones y
          chips de la Fase 7C, ningún tono de la paleta pastel llega al
          contraste mínimo (3:1) para un gráfico significativo sobre fondo
          claro. accentColor queda para el borde, que es acento, no
          contenido. */}
      {icon ? (
        <Ionicons name={icon} size={36} color={colors.textPrimary} />
      ) : (
        <Text style={styles.emoji}>{emoji}</Text>
      )}
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
