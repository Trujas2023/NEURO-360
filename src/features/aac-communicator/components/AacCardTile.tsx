import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AacTextSize } from '@shared/types';
import { colors, radius, spacing, typography } from '@shared/theme';

import { AacCardVisual } from './AacCardVisual';
import type { AacCard } from '../types';

const FONT_SIZE_BY_TEXT_SIZE: Record<AacTextSize, number> = {
  small: typography.sizes.sm,
  medium: typography.sizes.md,
  large: typography.sizes.lg,
};

export interface AacCardTileProps {
  card: AacCard;
  onPress: () => void;
  /** Ancho de la tarjeta; por defecto 140 (ver `cardWidthForBoardSize`). */
  width?: number;
  /** Mostrar el texto de la tarjeta. Por defecto `true`. */
  showLabel?: boolean;
  /** Mostrar el pictograma/foto. Por defecto `true`. */
  showVisual?: boolean;
  /** Mostrar el acento de color de categoría. Por defecto `true`. */
  showColorAccent?: boolean;
  textSize?: AacTextSize;
}

/**
 * Tarjeta grande de comunicación. Un solo toque; sin controles de edición
 * o borrado (eso vive únicamente en Modo Adulto). El color de categoría es
 * solo un refuerzo visual: la palabra y el pictograma/foto son lo que
 * identifica la tarjeta.
 */
export function AacCardTile({
  card,
  onPress,
  width = 140,
  showLabel = true,
  showVisual = true,
  showColorAccent = true,
  textSize = 'medium',
}: AacCardTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={card.label}
      accessibilityHint="Toca para escuchar y agregar a la frase"
      style={({ pressed }) => [styles.card, { width, minHeight: width, opacity: pressed ? 0.8 : 1 }]}
    >
      {showColorAccent ? <View style={[styles.accent, { backgroundColor: card.color }]} /> : null}
      {card.isFavorite ? (
        <Text style={styles.favorite} accessibilityElementsHidden>
          ⭐
        </Text>
      ) : null}
      {showVisual ? <AacCardVisual emoji={card.emoji} imageUri={card.imageUri} size={width * 0.46} /> : null}
      {showLabel ? (
        <Text style={[styles.label, { fontSize: FONT_SIZE_BY_TEXT_SIZE[textSize] }]} numberOfLines={2}>
          {card.label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  favorite: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    fontSize: typography.sizes.md,
  },
  label: {
    marginTop: spacing.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
