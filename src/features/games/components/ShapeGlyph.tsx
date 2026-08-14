import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import type { ShapeKind } from '../data/gameContent';

export interface ShapeGlyphProps {
  shape: ShapeKind;
  color: string;
  size?: number;
}

/**
 * Formas dibujadas con SVG en vez de emoji: el emoji cambia de dibujo
 * según el sistema operativo, y en un juego de emparejar formas la forma
 * exacta *es* el contenido — no puede depender de qué teléfono sea.
 */
export function ShapeGlyph({ shape, color, size = 84 }: ShapeGlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {shape === 'circle' ? <Circle cx={50} cy={50} r={42} fill={color} /> : null}

      {shape === 'square' ? <Rect x={10} y={10} width={80} height={80} rx={8} fill={color} /> : null}

      {shape === 'triangle' ? <Polygon points="50,10 92,88 8,88" fill={color} /> : null}

      {shape === 'diamond' ? <Polygon points="50,6 94,50 50,94 6,50" fill={color} /> : null}

      {shape === 'star' ? (
        <Polygon points="50,6 61,38 95,38 68,58 78,91 50,71 22,91 32,58 5,38 39,38" fill={color} />
      ) : null}

      {shape === 'heart' ? (
        <Path
          d="M50 88 C 18 66, 6 44, 20 28 C 32 14, 48 20, 50 34 C 52 20, 68 14, 80 28 C 94 44, 82 66, 50 88 Z"
          fill={color}
        />
      ) : null}
    </Svg>
  );
}
