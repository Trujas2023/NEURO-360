import { Pressable, StyleSheet } from 'react-native';

import { colors, minTouchTarget, radius, hairline } from '@shared/theme';

import type { AppIconName } from './AppIcon';
import { AppIcon } from './AppIcon';

export interface IconButtonProps {
  icon: AppIconName;
  /** Obligatorio: es la única forma en que un lector de pantalla identifica este control. */
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

/**
 * Botón de solo ícono para controles de interfaz (mover, editar, eliminar
 * — R1, ver docs/UX_UI_SYSTEM_SPEC.md §1.4, §5.4). Reemplaza los controles
 * que hoy usan emoji como ícono (↑ ↓ 🗑️ ⌫), inconsistentes entre
 * fabricantes Android. Área táctil de `minTouchTarget` (64dp) aunque el
 * glifo visual sea más pequeño, con relleno invisible alrededor.
 */
export function IconButton({
  icon,
  label,
  onPress,
  disabled = false,
  variant = 'default',
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.button, { opacity: disabled ? 0.3 : pressed ? 0.7 : 1 }]}
    >
      <AppIcon
        name={icon}
        size={22}
        color={variant === 'danger' ? colors.danger : colors.textPrimary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: hairline,
    borderColor: colors.border,
  },
});
