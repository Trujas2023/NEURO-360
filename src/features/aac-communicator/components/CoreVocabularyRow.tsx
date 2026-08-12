import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import { CORE_VOCABULARY, coreWordToCard } from '../data/coreVocabulary';
import { usePhrase } from '../context/PhraseContext';

/**
 * Vocabulario núcleo: fila siempre visible (no depende de categoría ni
 * perfil) con las palabras de mayor frecuencia de uso en AAC.
 */
export function CoreVocabularyRow() {
  const { addCard } = usePhrase();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vocabulario núcleo</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityLabel="Vocabulario núcleo, siempre disponible"
      >
        {CORE_VOCABULARY.map((word) => (
          <Pressable
            key={word.id}
            onPress={() => addCard(coreWordToCard(word))}
            accessibilityRole="button"
            accessibilityLabel={word.label}
            accessibilityHint="Toca para escuchar y agregar a la frase"
            style={({ pressed }) => [styles.chip, { borderColor: word.color, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.emoji}>{word.emoji}</Text>
            <Text style={styles.label}>{word.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    minWidth: 76,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emoji: {
    fontSize: typography.sizes.lg,
  },
  label: {
    marginTop: 2,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
