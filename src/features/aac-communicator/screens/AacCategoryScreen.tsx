import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { colors, spacing, typography } from '@shared/theme';

import { AacLayout } from '../components/AacLayout';
import { AacCardTile } from '../components/AacCardTile';
import { cardWidthForBoardSize } from '../constants/boardSize';
import { FAVORITES_CATEGORY_ID, MOST_USED_CATEGORY_ID, RECENT_CATEGORY_ID, getCategory } from '../constants/categories';
import { usePhrase } from '../context/PhraseContext';
import { useAacCards } from '../hooks/useAacCards';
import type { AacCard } from '../types';
import type { AacStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AacStackParamList, 'AacCategory'>;

const EMPTY_MESSAGES: Record<string, string> = {
  [FAVORITES_CATEGORY_ID]: 'Todavía no hay tarjetas favoritas.',
  [MOST_USED_CATEGORY_ID]: 'Todavía no se usó ninguna tarjeta.',
  [RECENT_CATEGORY_ID]: 'Todavía no se usó ninguna tarjeta.',
};

/** Tarjetas de una categoría real o virtual (Favoritos/Más usados/Recientes), siempre con la barra de frase visible. */
export function AacCategoryScreen({ route, navigation }: Props) {
  const { categoryId } = route.params;
  const { activeProfile } = useProfiles();
  const { cards, loading, incrementUsage } = useAacCards(activeProfile?.id ?? null);
  const { addCard } = usePhrase();
  const prefs = { ...DEFAULT_PROFILE_PREFERENCES, ...activeProfile?.preferences };
  const cardWidth = cardWidthForBoardSize(prefs.boardSize);

  const category = getCategory(categoryId);
  const activeCards = cards.filter((card) => card.active !== false);

  let visibleCards: AacCard[];
  if (categoryId === FAVORITES_CATEGORY_ID) {
    visibleCards = activeCards.filter((card) => card.isFavorite).sort((a, b) => a.order - b.order);
  } else if (categoryId === MOST_USED_CATEGORY_ID) {
    visibleCards = activeCards
      .filter((card) => (card.usageCount ?? 0) > 0)
      .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
      .slice(0, 24);
  } else if (categoryId === RECENT_CATEGORY_ID) {
    visibleCards = activeCards
      .filter((card) => !!card.lastUsedAt)
      .sort((a, b) => (b.lastUsedAt ?? '').localeCompare(a.lastUsedAt ?? ''))
      .slice(0, 24);
  } else {
    visibleCards = activeCards.filter((card) => card.categoryId === categoryId).sort((a, b) => a.order - b.order);
  }

  function handlePress(card: AacCard) {
    addCard(card);
    incrementUsage(card.id);
  }

  return (
    <AacLayout title={category ? `${category.emoji} ${category.label}` : 'Tarjetas'} onBack={() => navigation.goBack()}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : visibleCards.length === 0 ? (
        <Text style={styles.empty}>
          {EMPTY_MESSAGES[categoryId] ?? 'Todavía no hay tarjetas en esta categoría.'}
        </Text>
      ) : (
        <View style={styles.grid}>
          {visibleCards.map((card) => (
            <View key={card.id} style={styles.gridItem}>
              <AacCardTile
                card={card}
                onPress={() => handlePress(card)}
                width={cardWidth}
                showLabel={prefs.showCardText}
                showVisual={prefs.showCardImage}
                showColorAccent={prefs.showCardColor}
                textSize={prefs.textSize}
              />
            </View>
          ))}
        </View>
      )}
    </AacLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  gridItem: {
    marginBottom: spacing.sm,
  },
  empty: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
