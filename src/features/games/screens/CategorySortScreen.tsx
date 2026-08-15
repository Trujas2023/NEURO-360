import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { ChoiceGame } from '../components/ChoiceGame';
import type { GameRound } from '../components/ChoiceGame';
import { GAME_CATEGORIES, GAME_CATEGORY_ITEMS, pickRandom, shuffle } from '../data/gameContent';
import { useGameSettings } from '../hooks/useGameSettings';

type Props = NativeStackScreenProps<RootStackParamList, 'GameCategories'>;

/**
 * Se muestra un objeto y hay que elegir a qué grupo pertenece. Las
 * opciones incorrectas se toman siempre de categorías distintas a la
 * correcta, así nunca hay dos respuestas válidas en pantalla.
 */
function makeRound(optionCount: number): GameRound {
  const item = GAME_CATEGORY_ITEMS[Math.floor(Math.random() * GAME_CATEGORY_ITEMS.length)];
  const correct = GAME_CATEGORIES.find((category) => category.id === item.categoryId);
  const others = GAME_CATEGORIES.filter((category) => category.id !== item.categoryId);
  const distractors = pickRandom(others, Math.max(0, optionCount - 1));
  const options = shuffle(correct ? [correct, ...distractors] : distractors);

  return {
    prompt: `¿Dónde va ${item.label}?`,
    spokenPrompt: `¿Dónde va ${item.label}?`,
    target: (
      <View style={styles.item}>
        <Text style={styles.itemEmoji}>{item.emoji}</Text>
        <Text style={styles.itemLabel}>{item.label}</Text>
      </View>
    ),
    correctId: item.categoryId,
    choices: options.map((category) => ({
      id: category.id,
      label: category.label,
      content: (
        <View style={styles.category}>
          <Text style={styles.categoryEmoji}>{category.emoji}</Text>
          <Text style={styles.categoryLabel}>{category.label}</Text>
        </View>
      ),
    })),
  };
}

/** Clasificar objetos por categoría (animales, comida, ropa, juguetes). */
export function CategorySortScreen({ navigation }: Props) {
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
      title="🧺 Clasificar"
      gameId="categories"
      settings={settings}
      makeRound={makeRound}
      onExit={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 64,
  },
  itemLabel: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  category: {
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 48,
  },
  categoryLabel: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
