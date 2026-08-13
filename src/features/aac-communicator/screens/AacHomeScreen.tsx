import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { spacing, typography, colors } from '@shared/theme';

import { AacLayout } from '../components/AacLayout';
import { AacSearch } from '../components/AacSearch';
import { CategoryTile } from '../components/CategoryTile';
import { CoreVocabularyRow } from '../components/CoreVocabularyRow';
import { coreWordToCard } from '../data/coreVocabulary';
import { AAC_CATEGORIES, FAVORITES_CATEGORY_ID, MOST_USED_CATEGORY_ID, VIRTUAL_CATEGORY_IDS } from '../constants/categories';
import { usePhrase } from '../context/PhraseContext';
import { useAacCards } from '../hooks/useAacCards';
import type { AacStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AacStackParamList, 'AacHome'>;

/**
 * Pantalla principal de "Mi Voz": vocabulario núcleo, buscador y grilla de
 * categorías, siempre con la barra de frase visible. Es la raíz del tab
 * "Mi Voz" de `MainTabs`, así que no tiene botón "Volver" (se cambia de
 * tab con la barra inferior, ver `AacLayout`).
 */
export function AacHomeScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { cards, incrementUsage } = useAacCards(activeProfile?.id ?? null);
  const { addCard } = usePhrase();
  const prefs = { ...DEFAULT_PROFILE_PREFERENCES, ...activeProfile?.preferences };

  const quickCategories = AAC_CATEGORIES.filter((category) => {
    if (category.id === FAVORITES_CATEGORY_ID) return prefs.showFavorites;
    if (category.id === MOST_USED_CATEGORY_ID) return prefs.showMostUsed;
    return VIRTUAL_CATEGORY_IDS.includes(category.id);
  });
  const realCategories = prefs.showCategories
    ? AAC_CATEGORIES.filter((category) => !VIRTUAL_CATEGORY_IDS.includes(category.id))
    : [];

  return (
    <AacLayout title="Mi Voz">
      <CoreVocabularyRow />

      <AacSearch
        cards={cards}
        onSelectCard={(card) => {
          addCard(card);
          incrementUsage(card.id);
        }}
        onSelectCoreWord={(word) => addCard(coreWordToCard(word))}
      />

      {quickCategories.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          <View style={styles.grid}>
            {quickCategories.map((category) => (
              <View key={category.id} style={styles.gridItem}>
                <CategoryTile
                  category={category}
                  onPress={() => navigation.navigate('AacCategory', { categoryId: category.id })}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {realCategories.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <View style={styles.grid}>
            {realCategories.map((category) => (
              <View key={category.id} style={styles.gridItem}>
                <CategoryTile
                  category={category}
                  onPress={() => navigation.navigate('AacCategory', { categoryId: category.id })}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </AacLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
