import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, typography } from '@shared/theme';

export interface ToggleIconButtonProps {
  label: string;
  iconOn: string;
  iconOff: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

/** Botón de ícono grande (48dp) para prender/apagar algo dentro de un juego (sonido, vibración, brillo, ...). */
export function ToggleIconButton({ label, iconOn, iconOff, value, onToggle }: ToggleIconButtonProps) {
  return (
    <Pressable
      onPress={() => onToggle(!value)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: value }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: value ? colors.primary : colors.surface, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={styles.icon}>{value ? iconOn : iconOff}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: typography.sizes.lg,
  },
});
