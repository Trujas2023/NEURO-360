import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import type { AacCategory } from '../types';

export interface CategoryTileProps {
  category: AacCategory;
  onPress: () => void;
}

/** Botón grande de categoría para la pantalla principal del comunicador. */
export function CategoryTile({ category, onPress }: CategoryTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={category.label}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: category.color, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={styles.emoji}>{category.emoji}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {category.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 120,
    minHeight: 120,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  emoji: {
    fontSize: 40,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
