import { useWindowDimensions } from 'react-native';

/**
 * Puntos de corte de ancho disponible → columnas sugeridas (R1, ver
 * docs/PRODUCT_MASTER_SPEC.md §1.5). Valores conservadores (el extremo
 * inferior de cada rango del plan) para no forzar tarjetas demasiado
 * angostas en anchos límite.
 */
function breakpointColumns(width: number): number {
  if (width < 400) {
    return 2;
  }
  if (width < 700) {
    return 3;
  }
  if (width < 1000) {
    return 4;
  }
  return 5;
}

/**
 * Columnas recomendadas para una grilla de tarjetas según el ancho
 * disponible del dispositivo. `preferredColumns` es el mínimo deseado
 * (derivado, por ejemplo, de `boardSize` del perfil): en pantallas grandes
 * se permiten más columnas que ese mínimo, nunca menos — el ajuste del
 * adulto nunca se ignora, solo se supera cuando el espacio sobra.
 */
export function useResponsiveColumns(preferredColumns: number): number {
  const { width } = useWindowDimensions();
  return Math.max(preferredColumns, breakpointColumns(width));
}
