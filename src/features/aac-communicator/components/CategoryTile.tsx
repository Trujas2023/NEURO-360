import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@shared/theme';

import { useAacDisplaySettings } from '../hooks/useAacDisplaySettings';
import type { AacCategory } from '../types';

export interface CategoryTileProps {
  category: AacCategory;
  onPress: () => void;
}

/** Botón grande de categoría para la pantalla principal del comunicador, según la configuración visual del perfil (Módulo 9). */
export function CategoryTile({ category, onPress }: CategoryTileProps) {
  const display = useAacDisplaySettings();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={category.label}
      style={({ pressed }) => [
        styles.tile,
        {
          width: display.tileWidth,
          minHeight: display.minHeight,
          backgroundColor: category.color,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={{ fontSize: display.iconSize }}>{category.emoji}</Text>
      {display.showLabel ? (
        <Text style={[styles.label, { fontSize: display.fontSize }]} numberOfLines={2}>
          {category.label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  label: {
    marginTop: spacing.xs,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
