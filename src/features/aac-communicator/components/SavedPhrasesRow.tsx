import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import { usePhrase } from '../context/PhraseContext';

/**
 * Frases guardadas desde la barra de frase ("Guardar frase"): tocar una
 * la habla de inmediato; el botón ✕ la elimina (con confirmación, es
 * irreversible). No se muestra si todavía no se guardó ninguna.
 */
export function SavedPhrasesRow() {
  const { savedPhrases, speakSavedPhrase, deleteSavedPhrase } = usePhrase();

  if (savedPhrases.length === 0) {
    return null;
  }

  function confirmDelete(id: string, text: string) {
    Alert.alert('Eliminar frase guardada', `¿Eliminar "${text}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteSavedPhrase(id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frases guardadas</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityLabel="Frases guardadas"
      >
        {savedPhrases.map((saved) => {
          const text = saved.words.join(' ');
          return (
            <View key={saved.id} style={styles.chip}>
              <Pressable
                onPress={() => speakSavedPhrase(saved)}
                accessibilityRole="button"
                accessibilityLabel={text}
                accessibilityHint="Toca para escuchar esta frase guardada"
                style={({ pressed }) => [styles.chipTextButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.chipText} numberOfLines={1}>
                  {text}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => confirmDelete(saved.id, text)}
                accessibilityRole="button"
                accessibilityLabel={`Eliminar frase "${text}"`}
                style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </Pressable>
            </View>
          );
        })}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingLeft: spacing.sm,
    minHeight: 48,
    maxWidth: 220,
  },
  chipTextButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.xs,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  deleteButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
