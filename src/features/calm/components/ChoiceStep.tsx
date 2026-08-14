import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, touchTargets, typography } from '@shared/theme';

export interface ChoiceOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export interface ChoiceStepProps {
  question: string;
  options: ChoiceOption[];
  onSelect: (optionId: string) => void;
  selectedId?: string | null;
  /** Contenido opcional entre la pregunta y la grilla (p. ej. la silueta corporal). */
  children?: ReactNode;
}

/**
 * Un paso de un flujo guiado de Calma: una pregunta y opciones grandes.
 * Compartido por "Me duele" y "Tengo miedo / Estoy saturado" para que
 * ambos se vean y se usen igual, y para que agregar un flujo nuevo no
 * implique rehacer la interacción desde cero.
 */
export function ChoiceStep({ question, options, onSelect, selectedId, children }: ChoiceStepProps) {
  return (
    <View>
      <Text style={styles.question}>{question}</Text>

      {children}

      <View style={styles.grid}>
        {options.map((option) => {
          const selected = option.id === selectedId;
          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.card,
                { borderColor: option.color },
                selected && { backgroundColor: option.color },
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={styles.label} numberOfLines={2}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  card: {
    width: 132,
    minHeight: touchTargets.large + 40,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  emoji: {
    fontSize: 34,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
