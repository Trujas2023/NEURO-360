import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { usePhrase } from '../context/PhraseContext';

/**
 * Barra superior donde el niño arma la frase tocando tarjetas. Cada
 * palabra de la frase es a su vez tocable para quitarla individualmente
 * (además de "Borrar" la última y "Limpiar" todas).
 */
export function PhraseBar() {
  const { phrase, removeAt, removeLast, clear, speakPhrase } = usePhrase();
  const isEmpty = phrase.length === 0;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        accessibilityLabel="Frase actual"
      >
        {isEmpty ? (
          <Text style={styles.placeholder}>Toca tarjetas para armar una frase</Text>
        ) : (
          phrase.map((card, index) => (
            <Pressable
              key={`${card.id}-${index}`}
              onPress={() => removeAt(index)}
              accessibilityRole="button"
              accessibilityLabel={`Quitar "${card.label}" de la frase`}
              style={({ pressed }) => [
                styles.chip,
                { borderColor: card.color, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.chipText}>{card.label}</Text>
              <Text style={styles.chipRemove}>✕</Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <BigButton label="Hablar" emoji="🔊" onPress={speakPhrase} disabled={isEmpty} />
        </View>
        <View style={styles.actionButton}>
          <BigButton label="Borrar" emoji="⌫" variant="secondary" onPress={removeLast} disabled={isEmpty} />
        </View>
        <View style={styles.actionButton}>
          <BigButton label="Limpiar" emoji="🗑️" variant="ghost" onPress={clear} disabled={isEmpty} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: spacing.sm,
  },
  placeholder: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
  },
  chipText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  chipRemove: {
    marginLeft: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
