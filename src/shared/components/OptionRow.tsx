import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

export interface OptionRowOption<T extends string | number> {
  value: T;
  label: string;
}

export interface OptionRowProps<T extends string | number> {
  options: OptionRowOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Fila de chips seleccionables (una sola opción a la vez), para ajustes tipo "elegí uno de estos". */
export function OptionRow<T extends string | number>({ options, value, onChange }: OptionRowProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => (
        <Pressable
          key={String(option.value)}
          onPress={() => onChange(option.value)}
          accessibilityRole="button"
          accessibilityLabel={option.label}
          accessibilityState={{ selected: option.value === value }}
          style={[styles.chip, option.value === value && styles.chipSelected]}
        >
          <Text style={[styles.chipText, option.value === value && styles.chipTextSelected]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },
});
