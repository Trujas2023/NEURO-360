import { Ionicons } from '@expo/vector-icons';

import { colors } from '@shared/theme';

/**
 * Set cerrado de iconos de interfaz (R1, ver docs/UX_UI_SYSTEM_SPEC.md
 * §1.4). Estrictamente para controles de UI (mover, eliminar, cerrar,
 * volver...) — nunca para vocabulario AAC, que sigue usando
 * emoji/pictogramas a propósito. Limitar el nombre a esta unión evita que
 * cualquier parte de la app importe un glifo fuera de este catálogo
 * curado.
 */
export type AppIconName =
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-back'
  | 'chevron-forward'
  | 'trash-outline'
  | 'pencil-outline'
  | 'close'
  | 'close-circle'
  | 'checkmark'
  | 'checkmark-circle'
  | 'add'
  | 'home'
  | 'settings-outline'
  | 'lock-closed-outline'
  | 'alert-circle-outline'
  | 'information-circle-outline';

export interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
}

export function AppIcon({ name, size = 24, color = colors.textPrimary }: AppIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
