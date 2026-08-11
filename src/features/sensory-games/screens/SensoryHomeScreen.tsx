import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { GameCard } from '../components/GameCard';
import { SENSORY_GAMES } from '../constants/games';
import type { SensoryStackParamList } from '../navigation/types';
import type { SensoryGameId } from '../types';

type Props = NativeStackScreenProps<SensoryStackParamList, 'SensoryHome'>;

const GAME_ROUTES: Record<SensoryGameId, keyof SensoryStackParamList> = {
  bubbles: 'Bubbles',
  magicColors: 'MagicColors',
  followTheLight: 'FollowTheLight',
  touchAndListen: 'TouchAndListen',
  calmWaves: 'CalmWaves',
  sensoryDrawing: 'SensoryDrawing',
};

/** Pantalla principal de "Mundo Sensorial": las seis tarjetas de juegos, ajustes y volver. */
export function SensoryHomeScreen({ navigation }: Props) {
  const parentNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { activeProfile } = useProfiles();

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>🎮 Mundo Sensorial</Text>
      <Text style={styles.subtitle}>Elige un juego para jugar y regular.</Text>

      <View style={styles.grid}>
        {SENSORY_GAMES.map((game) => (
          <View key={game.id} style={styles.gridItem}>
            <GameCard game={game} onPress={() => navigation.navigate(GAME_ROUTES[game.id])} />
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        {activeProfile ? (
          <BigButton
            label="Ajustes sensoriales"
            emoji="⚙️"
            variant="secondary"
            onPress={() =>
              parentNavigation?.navigate('PinGate', {
                redirect: { screen: 'SensorySettings', params: { profileId: activeProfile.id } },
              })
            }
          />
        ) : null}
        <View style={styles.spacer} />
        <BigButton label="Volver" emoji="←" variant="ghost" onPress={() => parentNavigation?.goBack()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
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
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  spacer: {
    height: spacing.sm,
  },
});
