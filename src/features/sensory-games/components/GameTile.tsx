import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import type { SensoryGameInfo } from '../types';

export interface GameTileProps {
  game: SensoryGameInfo;
  onPress: () => void;
}

/** Botón grande de juego para el catálogo de "Juega & Regula"; los juegos sin `route` se ven disponibles pero se marcan "Pronto". */
export function GameTile({ game, onPress }: GameTileProps) {
  const available = Boolean(game.route);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={game.title}
      accessibilityHint={available ? undefined : 'Próximamente'}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: game.color, opacity: pressed ? 0.85 : available ? 1 : 0.7 },
      ]}
    >
      <Text style={styles.emoji}>{game.emoji}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {game.title}
      </Text>
      {!available ? <Text style={styles.badge}>Pronto</Text> : null}
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
  badge: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
});
