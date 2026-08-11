import { useWindowDimensions } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { spacing } from '@shared/theme';
import type { AacCardSize, AacColumns, AacDisplayMode } from '@shared/types';

const SIZE_METRICS: Record<AacCardSize, { minHeight: number; iconSize: number; fontSize: number }> = {
  large: { minHeight: 140, iconSize: 64, fontSize: 18 },
  medium: { minHeight: 112, iconSize: 48, fontSize: 15 },
  compact: { minHeight: 88, iconSize: 36, fontSize: 13 },
};

/** Máximo 2 a 4 columnas dependiendo del ancho del dispositivo (Módulo 2) cuando el ajuste es "Automático". */
function resolveColumns(columns: AacColumns, width: number): number {
  if (columns !== 'auto') {
    return columns;
  }
  if (width < 380) {
    return 2;
  }
  if (width < 620) {
    return 3;
  }
  return 4;
}

export interface AacDisplaySettings {
  columns: number;
  tileWidth: number;
  minHeight: number;
  iconSize: number;
  fontSize: number;
  showLabel: boolean;
}

/**
 * Traduce las preferencias visuales del perfil activo (Módulo 9: tamaño,
 * modo de vista, columnas) a medidas concretas para las grillas del
 * comunicador. Si no hay perfil activo o preferencias, usa el modo
 * recomendado por defecto (grande, imagen + texto grande, automático).
 */
export function useAacDisplaySettings(): AacDisplaySettings {
  const { activeProfile } = useProfiles();
  const { width } = useWindowDimensions();
  const preferences = activeProfile?.preferences;

  const cardSize: AacCardSize = preferences?.cardSize ?? 'large';
  const displayMode: AacDisplayMode = preferences?.displayMode ?? 'imageTextLarge';
  const columnsPreference: AacColumns = preferences?.columns ?? 'auto';

  const columns = resolveColumns(columnsPreference, width);
  const horizontalPadding = spacing.lg * 2;
  const gaps = spacing.md * (columns - 1);
  const tileWidth = Math.floor((width - horizontalPadding - gaps) / columns);

  const metrics = SIZE_METRICS[cardSize];
  const fontSize = displayMode === 'imageTextLarge' ? metrics.fontSize + 3 : metrics.fontSize;

  return {
    columns,
    tileWidth: Math.max(tileWidth, 88),
    minHeight: metrics.minHeight,
    iconSize: metrics.iconSize,
    fontSize,
    showLabel: displayMode !== 'imageOnly',
  };
}
