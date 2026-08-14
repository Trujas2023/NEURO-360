import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { ScreenContainer } from '@shared/components';
import { colors } from '@shared/theme';

import { ChoiceGame } from '../components/ChoiceGame';
import type { GameRound } from '../components/ChoiceGame';
import { GAME_EMOTIONS, pickRandom, shuffle } from '../data/gameContent';
import { useGameSettings } from '../hooks/useGameSettings';

type Props = NativeStackScreenProps<RootStackParamList, 'GameEmotions'>;

/**
 * Se muestra el nombre de la emoción y hay que elegir la cara, y no al
 * revés: leer una cara y elegir entre palabras exigiría saber leer,
 * mientras que la consigna se escucha en voz alta.
 */
function makeRound(optionCount: number): GameRound {
  const options = pickRandom(GAME_EMOTIONS, optionCount);
  const target = options[Math.floor(Math.random() * options.length)];

  return {
    prompt: `¿Quién está ${target.label}?`,
    spokenPrompt: `¿Quién está ${target.label}?`,
    correctId: target.id,
    choices: shuffle(options).map((emotion) => ({
      id: emotion.id,
      label: emotion.label,
      content: <Text style={styles.face}>{emotion.emoji}</Text>,
    })),
  };
}

/** Reconocer emociones básicas a partir de expresiones faciales. */
export function EmotionsScreen({ navigation }: Props) {
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
      title="😊 Emociones"
      settings={settings}
      makeRound={makeRound}
      onExit={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  face: {
    fontSize: 68,
  },
});
