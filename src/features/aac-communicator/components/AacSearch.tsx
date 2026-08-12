import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import { AacCardVisual } from './AacCardVisual';
import { CORE_VOCABULARY } from '../data/coreVocabulary';
import type { AacCard, CoreWord } from '../types';

export interface AacSearchProps {
  cards: AacCard[];
  onSelectCard: (card: AacCard) => void;
  onSelectCoreWord: (word: CoreWord) => void;
}

/**
 * Buscador AAC: local y offline, sin llamadas de red. Busca por texto
 * entre las tarjetas del perfil activo (activas únicamente) y el
 * vocabulario núcleo.
 */
export function AacSearch({ cards, onSelectCard, onSelectCoreWord }: AacSearchProps) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();

  const cardResults = useMemo(() => {
    if (!normalized) {
      return [];
    }
    return cards
      .filter((card) => card.active !== false && card.label.toLowerCase().includes(normalized))
      .slice(0, 12);
  }, [cards, normalized]);

  const coreResults = useMemo(() => {
    if (!normalized) {
      return [];
    }
    return CORE_VOCABULARY.filter((word) => word.label.toLowerCase().includes(normalized)).slice(0, 8);
  }, [normalized]);

  const hasResults = cardResults.length > 0 || coreResults.length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar una palabra o tarjeta…"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        accessibilityLabel="Buscar en el comunicador"
        returnKeyType="search"
        autoCorrect={false}
      />

      {normalized ? (
        hasResults ? (
          <View style={styles.results}>
            {coreResults.map((word) => (
              <Pressable
                key={word.id}
                onPress={() => {
                  onSelectCoreWord(word);
                  setQuery('');
                }}
                accessibilityRole="button"
                accessibilityLabel={word.label}
                style={({ pressed }) => [styles.resultRow, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.resultEmoji}>{word.emoji}</Text>
                <Text style={styles.resultLabel}>{word.label}</Text>
                <Text style={styles.resultTag}>Núcleo</Text>
              </Pressable>
            ))}
            {cardResults.map((card) => (
              <Pressable
                key={card.id}
                onPress={() => {
                  onSelectCard(card);
                  setQuery('');
                }}
                accessibilityRole="button"
                accessibilityLabel={card.label}
                style={({ pressed }) => [styles.resultRow, { opacity: pressed ? 0.7 : 1 }]}
              >
                <AacCardVisual emoji={card.emoji} imageUri={card.imageUri} size={28} />
                <Text style={styles.resultLabel}>{card.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>Sin resultados para &quot;{query.trim()}&quot;.</Text>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  results: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultEmoji: {
    fontSize: typography.sizes.lg,
    width: 28,
    textAlign: 'center',
  },
  resultLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  resultTag: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  empty: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
