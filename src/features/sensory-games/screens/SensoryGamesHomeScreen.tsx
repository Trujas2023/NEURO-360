import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { GameTile } from '../components/GameTile';
import { SENSORY_GAMES } from '../constants/games';
import type { SensoryGamesStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SensoryGamesStackParamList, 'SensoryGamesHome'>;

/** Catálogo de "Juega & Regula": los juegos ya implementados abren su pantalla; el resto navega a `ComingSoon`. */
export function SensoryGamesHomeScreen({ navigation }: Props) {
  const parentNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer scrollable>
      <BigButton
        label="Volver"
        variant="ghost"
        fullWidth={false}
        onPress={() => parentNavigation?.goBack()}
      />

      <Text style={styles.title}>🎮 Juega & Regula</Text>
      <Text style={styles.subtitle}>Elige un juego</Text>

      <View style={styles.grid}>
        {SENSORY_GAMES.map((game) => (
          <View key={game.id} style={styles.gridItem}>
            <GameTile
              game={game}
              onPress={() =>
                game.route
                  ? navigation.navigate(game.route)
                  : parentNavigation?.navigate('ComingSoon', {
                      title: game.title,
                      emoji: game.emoji,
                    })
              }
            />
          </View>
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
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  gridItem: {
    marginBottom: spacing.sm,
  },
});
