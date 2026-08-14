import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { ScreenContainer } from '@shared/components';
import { colors } from '@shared/theme';

import { ChoiceGame } from '../components/ChoiceGame';
import type { GameRound } from '../components/ChoiceGame';
import { ShapeGlyph } from '../components/ShapeGlyph';
import { GAME_SHAPES, pickRandom, shuffle } from '../data/gameContent';
import { useGameSettings } from '../hooks/useGameSettings';

type Props = NativeStackScreenProps<RootStackParamList, 'GameShapes'>;

/**
 * Todas las figuras se dibujan del mismo color a propósito: si cada una
 * tuviera el suyo, el niño podría acertar emparejando colores sin mirar
 * la forma, que es justo lo que el juego quiere practicar.
 */
const SHAPE_COLOR = colors.accent;

function makeRound(optionCount: number): GameRound {
  const options = pickRandom(GAME_SHAPES, optionCount);
  const target = options[Math.floor(Math.random() * options.length)];

  return {
    prompt: `Toca el ${target.label}`,
    spokenPrompt: `Toca el ${target.label}.`,
    target: <ShapeGlyph shape={target.id} color={SHAPE_COLOR} size={64} />,
    correctId: target.id,
    choices: shuffle(options).map((shape) => ({
      id: shape.id,
      label: shape.label,
      content: <ShapeGlyph shape={shape.id} color={SHAPE_COLOR} size={92} />,
    })),
  };
}

/** Emparejar formas: se muestra una figura y hay que tocar la igual. */
export function ShapeMatchScreen({ navigation }: Props) {
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
      title="🔷 Formas"
      settings={settings}
      makeRound={makeRound}
      onExit={() => navigation.goBack()}
    />
  );
}
