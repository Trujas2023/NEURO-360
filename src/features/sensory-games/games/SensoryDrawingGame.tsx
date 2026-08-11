import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { colors } from '@shared/theme';
import { createId } from '@shared/utils/id';

interface Stroke {
  id: string;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) {
    return '';
  }
  return points.reduce(
    (d, point, index) => `${d}${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)} `,
    '',
  );
}

const MIN_POINT_DISTANCE = 3;

export interface SensoryDrawingGameProps {
  color: string;
  strokeWidth: number;
  glowEnabled: boolean;
  /** Se incrementa desde la pantalla para pedir "Limpiar pantalla". */
  clearSignal: number;
}

/** Lienzo táctil: dibujar con el dedo. No se guarda ni se pide registro; el dibujo se pierde al salir. */
export function SensoryDrawingGame({ color, strokeWidth, glowEnabled, clearSignal }: SensoryDrawingGameProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const [appliedClearSignal, setAppliedClearSignal] = useState(clearSignal);
  if (clearSignal !== appliedClearSignal) {
    setAppliedClearSignal(clearSignal);
    setStrokes([]);
    setCurrentStroke(null);
  }

  /* eslint-disable react-hooks/refs --
     Los manejadores de PanResponder solo corren ante toques reales, nunca
     durante el render; ver la misma nota en MagicColorsGame. */
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      lastPoint.current = { x: locationX, y: locationY };
      setCurrentStroke({ id: createId(), color, width: strokeWidth, points: [{ x: locationX, y: locationY }] });
    },
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const last = lastPoint.current;
      if (last && Math.hypot(locationX - last.x, locationY - last.y) < MIN_POINT_DISTANCE) {
        return;
      }
      lastPoint.current = { x: locationX, y: locationY };
      setCurrentStroke((stroke) =>
        stroke ? { ...stroke, points: [...stroke.points, { x: locationX, y: locationY }] } : stroke,
      );
    },
    onPanResponderRelease: () => {
      lastPoint.current = null;
      setCurrentStroke((stroke) => {
        if (stroke && stroke.points.length > 0) {
          setStrokes((current) => [...current, stroke]);
        }
        return null;
      });
    },
  });
  /* eslint-enable react-hooks/refs */

  const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

  return (
    <View style={styles.canvas} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        {glowEnabled &&
          allStrokes.map((stroke) => (
            <Path
              key={`${stroke.id}-glow`}
              d={pointsToPath(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.width * 2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.25}
            />
          ))}
        {allStrokes.map((stroke) => (
          <Path
            key={stroke.id}
            d={pointsToPath(stroke.points)}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
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
