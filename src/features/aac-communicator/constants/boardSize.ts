import type { AacBoardSize } from '@shared/types';

/**
 * Traduce el ajuste "Tamaño del tablero" (columnas x filas visibles) a un
 * ancho de tarjeta: menos columnas → tarjetas más grandes, más columnas →
 * tarjetas más chicas y más por fila. No depende del ancho de pantalla
 * (`Dimensions`) para mantener el layout simple y predecible con
 * `flexWrap`, igual que el resto de las grillas de la app.
 */
const CARD_WIDTH_BY_COLUMNS: Record<number, number> = {
  2: 172,
  3: 140,
  4: 108,
};

export function cardWidthForBoardSize(boardSize?: AacBoardSize): number {
  const columns = Number(boardSize?.split('x')[0] ?? 3);
  return CARD_WIDTH_BY_COLUMNS[columns] ?? CARD_WIDTH_BY_COLUMNS[3];
}
