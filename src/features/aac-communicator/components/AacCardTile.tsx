import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import { AacCardVisual } from './AacCardVisual';
import type { AacCard } from '../types';

export interface AacCardTileProps {
  card: AacCard;
  onPress: () => void;
}

/**
 * Tarjeta grande de comunicación. Un solo toque; sin controles de edición
 * o borrado (eso vive únicamente en Modo Adulto). El color de categoría es
 * solo un refuerzo visual: la palabra y el pictograma/foto son lo que
 * identifica la tarjeta.
 */
export function AacCardTile({ card, onPress }: AacCardTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={card.label}
      accessibilityHint="Toca para escuchar y agregar a la frase"
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.accent, { backgroundColor: card.color }]} />
      {card.isFavorite ? (
        <Text style={styles.favorite} accessibilityElementsHidden>
          ⭐
        </Text>
      ) : null}
      <AacCardVisual emoji={card.emoji} imageUri={card.imageUri} size={64} />
      <Text style={styles.label} numberOfLines={2}>
        {card.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    minHeight: 140,
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
