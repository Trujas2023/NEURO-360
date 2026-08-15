import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { ScreenContainer } from '@shared/components';
import { colors, radius } from '@shared/theme';

import { ChoiceGame } from '../components/ChoiceGame';
import type { GameRound } from '../components/ChoiceGame';
import { GAME_COLORS, pickRandom, shuffle } from '../data/gameContent';
import { useGameSettings } from '../hooks/useGameSettings';

type Props = NativeStackScreenProps<RootStackParamList, 'GameColors'>;

function Swatch({ value, size }: { value: string; size: number }) {
  return <View style={[styles.swatch, { backgroundColor: value, width: size, height: size }]} />;
}

/**
 * A nivel de módulo y no dentro del componente: `ChoiceGame` la usa en
 * callbacks y efectos, así que su identidad tiene que ser estable.
 */
function makeRound(optionCount: number): GameRound {
  const options = pickRandom(GAME_COLORS, optionCount);
  const target = options[Math.floor(Math.random() * options.length)];

  return {
    prompt: `Toca el color ${target.label}`,
    spokenPrompt: `Toca el color ${target.label}.`,
    target: <Swatch value={target.value} size={72} />,
    correctId: target.id,
    choices: shuffle(options).map((color) => ({
      id: color.id,
      label: color.label,
      content: <Swatch value={color.value} size={96} />,
    })),
  };
}

/** Emparejar colores: se muestra un color y hay que tocar el igual. */
export function ColorMatchScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings, loading } = useGameSettings(activeProfile?.id ?? null);

  if (loading) {
    return (
      <ScreenContainer centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ChoiceGame
      title="🎨 Colores"
      gameId="colors"
      settings={settings}
      makeRound={makeRound}
      onExit={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  swatch: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
});
