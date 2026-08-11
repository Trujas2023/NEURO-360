import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, minTouchTarget, radius, spacing, typography } from '@shared/theme';

import type { SensoryGameDefinition } from '../types';

export interface GameCardProps {
  game: SensoryGameDefinition;
  onPress: () => void;
}

/** Tarjeta grande de juego para la pantalla principal de Mundo Sensorial. */
export function GameCard({ game, onPress }: GameCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={game.label}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: game.color, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={styles.emoji}>{game.emoji}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {game.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    minHeight: Math.max(140, minTouchTarget),
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  emoji: {
    fontSize: 48,
  },
  label: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
