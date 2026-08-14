import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { GAMES } from '../data/games';
import type { GameId } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GamesHome'>;

/** Rutas de juego; todas sin parámetros, lo que permite navegar con la clave calculada. */
type GameRoute =
  | 'GameColors'
  | 'GameShapes'
  | 'GameEmotions'
  | 'GameCategories'
  | 'GameMemory'
  | 'GameSequence';

const ROUTE_BY_GAME: Record<GameId, GameRoute> = {
  colors: 'GameColors',
  shapes: 'GameShapes',
  emotions: 'GameEmotions',
  categories: 'GameCategories',
  memory: 'GameMemory',
  sequence: 'GameSequence',
};

/** Selector de juegos de "Juega & Regula". */
export function GamesHomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer scrollable>
      <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => navigation.goBack()} />

      <Text style={styles.title}>🎮 Juega & Regula</Text>
      <Text style={styles.subtitle}>Elige un juego</Text>

      <View style={styles.grid}>
        {GAMES.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => navigation.navigate(ROUTE_BY_GAME[game.id])}
            accessibilityRole="button"
            accessibilityLabel={game.label}
            accessibilityHint={game.description}
            style={({ pressed }) => [styles.card, { borderColor: game.color, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.emoji}>{game.emoji}</Text>
            <Text style={styles.label}>{game.label}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {game.description}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.md,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  card: {
    width: 150,
    minHeight: 150,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
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
