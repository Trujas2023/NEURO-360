import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { DEFAULT_COMMUNICATION_LEVEL, DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { spacing, typography, colors } from '@shared/theme';

import { AacCardTile } from '../components/AacCardTile';
import { AacLayout } from '../components/AacLayout';
import { AacSearch } from '../components/AacSearch';
import { CategoryTile } from '../components/CategoryTile';
import { CoreVocabularyRow } from '../components/CoreVocabularyRow';
import { QuickCommunication } from '../components/QuickCommunication';
import { SavedPhrasesRow } from '../components/SavedPhrasesRow';
import { cardWidthForBoardSize } from '../constants/boardSize';
import { AAC_CATEGORIES, FAVORITES_CATEGORY_ID, MOST_USED_CATEGORY_ID, VIRTUAL_CATEGORY_IDS } from '../constants/categories';
import { usePhrase } from '../context/PhraseContext';
import { CORE_VOCABULARY, coreWordToCard } from '../data/coreVocabulary';
import { ESSENTIAL_VOCABULARY } from '../data/essentialVocabulary';
import { useAacCards } from '../hooks/useAacCards';
import type { AacStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AacStackParamList, 'AacHome'>;

const LEVEL_2_WORD_COUNT = 12;

/**
 * Pantalla principal de "Mi Voz". Es la raíz del tab "Mi Voz" de
 * `MainTabs` (no tiene botón "Volver": se cambia de tab). Su contenido se
 * adapta automáticamente al nivel de comunicación del perfil
 * (`communicationLevel`, Modo Adulto → Ajustes de Mi Voz):
 *
 * - Nivel 1: 2-4 opciones grandes, habla inmediata, sin barra de frase.
 * - Nivel 2: una sola grilla con hasta 12 tarjetas núcleo, sin categorías.
 * - Nivel 3: vocabulario núcleo + categorías, sin buscador ni accesos rápidos.
 * - Nivel 4: comunicador completo (comportamiento histórico).
 */
export function AacHomeScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { cards, incrementUsage } = useAacCards(activeProfile?.id ?? null);
  const { addCard } = usePhrase();
  const prefs = { ...DEFAULT_PROFILE_PREFERENCES, ...activeProfile?.preferences };
  const level = activeProfile?.communicationLevel ?? DEFAULT_COMMUNICATION_LEVEL;
  const cardWidth = cardWidthForBoardSize(prefs.boardSize);

  if (level === 'LEVEL_1') {
    return (
      <AacLayout title="Mi Voz" showPhraseBar={false}>
        <QuickCommunication phrases={ESSENTIAL_VOCABULARY} />
      </AacLayout>
    );
  }

  if (level === 'LEVEL_2') {
    return (
      <AacLayout title="Mi Voz">
        <View style={styles.grid}>
          {CORE_VOCABULARY.slice(0, LEVEL_2_WORD_COUNT).map((word) => (
            <View key={word.id} style={styles.gridItem}>
              <AacCardTile
                card={coreWordToCard(word)}
                onPress={() => addCard(coreWordToCard(word))}
                width={cardWidth}
                showLabel={prefs.showCardText}
                showVisual={prefs.showCardImage}
                showColorAccent={prefs.showCardColor}
                textSize={prefs.textSize}
              />
            </View>
          ))}
        </View>
      </AacLayout>
    );
  }

  const realCategories = AAC_CATEGORIES.filter((category) => !VIRTUAL_CATEGORY_IDS.includes(category.id));

  if (level === 'LEVEL_3') {
    return (
      <AacLayout title="Mi Voz">
        <CoreVocabularyRow />
        <SavedPhrasesRow />
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
      </AacLayout>
    );
  }

  // Nivel 4: comunicador completo.
  const quickCategories = AAC_CATEGORIES.filter((category) => {
    if (category.id === FAVORITES_CATEGORY_ID) return prefs.showFavorites;
    if (category.id === MOST_USED_CATEGORY_ID) return prefs.showMostUsed;
    return VIRTUAL_CATEGORY_IDS.includes(category.id);
  });
  const visibleCategories = prefs.showCategories ? realCategories : [];

  return (
    <AacLayout title="Mi Voz">
      <CoreVocabularyRow />
      <SavedPhrasesRow />

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

      {visibleCategories.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <View style={styles.grid}>
            {visibleCategories.map((category) => (
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
