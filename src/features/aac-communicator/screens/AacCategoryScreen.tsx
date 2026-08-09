import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { colors, spacing, typography } from '@shared/theme';

import { AacLayout } from '../components/AacLayout';
import { AacCardTile } from '../components/AacCardTile';
import { FAVORITES_CATEGORY_ID, getCategory } from '../constants/categories';
import { usePhrase } from '../context/PhraseContext';
import { useAacCards } from '../hooks/useAacCards';
import type { AacStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AacStackParamList, 'AacCategory'>;

/** Tarjetas de una categoría (o de Favoritos), siempre con la barra de frase visible. */
export function AacCategoryScreen({ route, navigation }: Props) {
  const { categoryId } = route.params;
  const { activeProfile } = useProfiles();
  const { cards, loading } = useAacCards(activeProfile?.id ?? null);
  const { addCard } = usePhrase();

  const category = getCategory(categoryId);
  const visibleCards = cards
    .filter((card) => (categoryId === FAVORITES_CATEGORY_ID ? card.isFavorite : card.categoryId === categoryId))
    .sort((a, b) => a.order - b.order);

  return (
    <AacLayout title={category ? `${category.emoji} ${category.label}` : 'Tarjetas'} onBack={() => navigation.goBack()}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : visibleCards.length === 0 ? (
        <Text style={styles.empty}>
          {categoryId === FAVORITES_CATEGORY_ID
            ? 'Todavía no hay tarjetas favoritas.'
            : 'Todavía no hay tarjetas en esta categoría.'}
        </Text>
      ) : (
        <View style={styles.grid}>
          {visibleCards.map((card) => (
            <View key={card.id} style={styles.gridItem}>
              <AacCardTile card={card} onPress={() => addCard(card)} />
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
