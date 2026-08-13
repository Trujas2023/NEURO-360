import { Platform } from 'react-native';

/**
 * Sombras suaves (nunca agresivas): refuerzan jerarquía sin sumar ruido
 * visual. `elevation` cubre Android; las propiedades `shadow*` cubren
 * iOS/web. Se usan juntas porque React Native no unifica ambas.
 */
function shadow(elevation: number, opacity: number, radius: number) {
  return Platform.select({
    android: { elevation },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  });
}

export const shadows = {
  none: shadow(0, 0, 0),
  sm: shadow(2, 0.06, 4),
  md: shadow(4, 0.08, 8),
  lg: shadow(8, 0.1, 16),
} as const;
