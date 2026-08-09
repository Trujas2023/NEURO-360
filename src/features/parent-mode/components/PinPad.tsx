import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  length: number;
}

/** Puntos de progreso + teclado numérico grande para introducir el PIN de adulto. */
export function PinPad({ value, onChange, length }: PinPadProps) {
  function handleKeyPress(key: string) {
    if (key === '') {
      return;
    }
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length < length) {
      onChange(value + key);
    }
  }

  return (
    <View>
      <View style={styles.dots}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index < value.length && styles.dotFilled]}
            accessible={false}
          />
        ))}
      </View>

      <View style={styles.grid}>
        {KEYS.map((key, index) => (
          <Pressable
            key={`${key}-${index}`}
            onPress={() => handleKeyPress(key)}
            disabled={key === ''}
            accessibilityRole="button"
            accessibilityLabel={key === 'del' ? 'Borrar' : key === '' ? undefined : `Dígito ${key}`}
            style={({ pressed }) => [
              styles.key,
              key === '' && styles.keyEmpty,
              pressed && key !== '' ? styles.keyPressed : null,
            ]}
          >
            <Text style={styles.keyLabel}>{key === 'del' ? '⌫' : key}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    margin: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  keyPressed: {
    opacity: 0.7,
  },
  keyLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
