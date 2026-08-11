import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

import { colors } from '@shared/theme';
import { createId } from '@shared/utils/id';

import type { MagicColorsPalette, MagicColorsShapeType } from '../types';

const PASTEL_COLORS = [colors.accent, colors.blush, colors.lavender, colors.secondary, colors.primary, colors.warning];
const VIVID_COLORS = ['#FF6F61', '#3DC9C9', '#FFC93C', '#4D96FF', '#B983FF', '#FF7EB6'];
const MIN_DISTANCE_BETWEEN_SHAPES = 18;
const MAX_SHAPES = 220;

interface Shape {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
}

export interface MagicColorsGameProps {
  shapeType: MagicColorsShapeType;
  palette: MagicColorsPalette;
  /** Se incrementa desde la pantalla para pedir "Limpiar pantalla". */
  clearSignal: number;
}

function randomColor(palette: MagicColorsPalette): string {
  const source = palette === 'vivid' ? VIVID_COLORS : PASTEL_COLORS;
  return source[Math.floor(Math.random() * source.length)];
}

/** Pantalla táctil: tocar o arrastrar deja círculos/manchas de colores suaves. Sin flashes. */
export function MagicColorsGame({ shapeType, palette, clearSignal }: MagicColorsGameProps) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [appliedClearSignal, setAppliedClearSignal] = useState(clearSignal);

  if (clearSignal !== appliedClearSignal) {
    setAppliedClearSignal(clearSignal);
    setShapes([]);
  }

  /* eslint-disable react-hooks/purity, react-hooks/refs --
     addShapesAt y los manejadores de PanResponder solo se ejecutan ante
     toques reales, nunca durante el render; el análisis estático no puede
     seguir esa indirección (PanResponder.create) y marca Math.random y la
     lectura de `lastPoint.current` como si fueran parte del render. Es el
     mismo patrón, en esencia, que un manejador `onPress`. */
  function addShapesAt(x: number, y: number) {
    const baseRadius = 14 + Math.random() * 16;
    const newShapes: Shape[] =
      shapeType === 'blob'
        ? [0, 1, 2].map((offsetIndex) => ({
            id: createId(),
            x: x + (Math.random() - 0.5) * baseRadius,
            y: y + (Math.random() - 0.5) * baseRadius,
            radius: baseRadius * (offsetIndex === 0 ? 1 : 0.6),
            color: randomColor(palette),
            opacity: 0.75,
          }))
        : [
            {
              id: createId(),
              x,
              y,
              radius: baseRadius,
              color: randomColor(palette),
              opacity: 0.85,
            },
          ];

    setShapes((current) => {
      const next = [...current, ...newShapes];
      return next.length > MAX_SHAPES ? next.slice(next.length - MAX_SHAPES) : next;
    });
  }

  // No se envuelve en useMemo/useState: PanResponder.create es liviano, y
  // envolverlo en un hook de memoización hace que el análisis de pureza de
  // React trate sus callbacks como parte del cálculo del render.
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      lastPoint.current = { x: locationX, y: locationY };
      addShapesAt(locationX, locationY);
    },
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const last = lastPoint.current;
      if (last) {
        const distance = Math.hypot(locationX - last.x, locationY - last.y);
        if (distance < MIN_DISTANCE_BETWEEN_SHAPES) {
          return;
        }
      }
      lastPoint.current = { x: locationX, y: locationY };
      addShapesAt(locationX, locationY);
    },
    onPanResponderRelease: () => {
      lastPoint.current = null;
    },
  });
  /* eslint-enable react-hooks/purity, react-hooks/refs */

  return (
    <View style={styles.canvas} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        {shapes.map((shape) => (
          <Circle
            key={shape.id}
            cx={shape.x}
            cy={shape.y}
            r={shape.radius}
            fill={shape.color}
            opacity={shape.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
