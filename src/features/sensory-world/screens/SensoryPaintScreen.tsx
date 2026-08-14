import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { softTap } from '@services/haptics/haptics';
import { BigButton } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';
import { createId } from '@shared/utils/id';

import { ActivityFrame } from '../components/ActivityFrame';
import { SENSORY_PALETTE } from '../data/activities';
import { useSensorySettings } from '../hooks/useSensorySettings';
import type { PaintMode } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensoryPaint'>;

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  id: string;
  points: Point[];
  color: string;
  mode: PaintMode;
}

const MODE_LABELS: { value: PaintMode; label: string }[] = [
  { value: 'stroke', label: 'Trazo' },
  { value: 'particles', label: 'Partículas' },
  { value: 'glow', label: 'Brillo' },
  { value: 'shapes', label: 'Formas' },
];

/** Tope de puntos por trazo: evita que un dibujo largo degrade el rendimiento. */
const MAX_POINTS_PER_STROKE = 240;

function toPathD(points: Point[]): string {
  if (points.length === 0) {
    return '';
  }
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y}` + rest.map((point) => ` L ${point.x} ${point.y}`).join('');
}

/** Un punto de cada `step`, para no dibujar cientos de formas superpuestas. */
function sample(points: Point[], step: number): Point[] {
  return points.filter((_, index) => index % step === 0);
}

function StrokeShape({ stroke }: { stroke: Stroke }) {
  const { points, color, mode } = stroke;

  if (mode === 'particles') {
    return (
      <>
        {sample(points, 3).map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r={3 + (index % 4)} fill={color} opacity={0.75} />
        ))}
      </>
    );
  }

  if (mode === 'shapes') {
    return (
      <>
        {sample(points, 10).map((point, index) =>
          index % 2 === 0 ? (
            <Circle key={index} cx={point.x} cy={point.y} r={16} fill={color} opacity={0.55} />
          ) : (
            <Rect
              key={index}
              x={point.x - 14}
              y={point.y - 14}
              width={28}
              height={28}
              rx={6}
              fill={color}
              opacity={0.55}
            />
          ),
        )}
      </>
    );
  }

  const d = toPathD(points);

  if (mode === 'glow') {
    return (
      <>
        <Path d={d} stroke={color} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.18} />
        <Path d={d} stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
      </>
    );
  }

  return <Path d={d} stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
}

/**
 * Pintura con el dedo. Usa `PanResponder` (parte de React Native) para
 * seguir el dedo y `react-native-svg` para dibujar: un trazo real, no
 * cientos de vistas superpuestas.
 *
 * No hay "mal dibujo" posible: nada se corrige, nada se puntúa, y
 * "Limpiar" empieza de cero sin confirmación porque borrar un dibujo no
 * es una pérdida que haya que proteger.
 */
export function SensoryPaintScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings, updateSettings } = useSensorySettings(activeProfile?.id ?? null);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<Stroke | null>(null);
  const [color, setColor] = useState(SENSORY_PALETTE[0]);

  const mode = settings.paintMode;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          setCurrent({ id: createId(), points: [{ x: locationX, y: locationY }], color, mode });
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          setCurrent((stroke) => {
            if (!stroke || stroke.points.length >= MAX_POINTS_PER_STROKE) {
              return stroke;
            }
            return { ...stroke, points: [...stroke.points, { x: locationX, y: locationY }] };
          });
        },
        onPanResponderRelease: () => {
          setCurrent((stroke) => {
            if (stroke) {
              setStrokes((all) => [...all, stroke]);
            }
            return null;
          });
        },
      }),
    [color, mode],
  );

  return (
    <ActivityFrame
      title="🎨 Pintura"
      onFinish={() => navigation.goBack()}
      footer={
        <View>
          <View style={styles.row}>
            {SENSORY_PALETTE.map((swatch) => (
              <Pressable
                key={swatch}
                onPress={() => {
                  setColor(swatch);
                  softTap(settings.hapticsEnabled);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Elegir color ${swatch}`}
                accessibilityState={{ selected: swatch === color }}
                style={[styles.swatch, { backgroundColor: swatch }, swatch === color && styles.swatchSelected]}
              />
            ))}
          </View>

          <View style={styles.row}>
            {MODE_LABELS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => updateSettings({ paintMode: option.value })}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: mode === option.value }}
                style={[styles.modeChip, mode === option.value && styles.modeChipSelected]}
              >
                <Text style={[styles.modeChipText, mode === option.value && styles.modeChipTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <BigButton
            label="Limpiar"
            emoji="🧽"
            variant="secondary"
            onPress={() => {
              setStrokes([]);
              setCurrent(null);
            }}
          />
        </View>
      }
    >
      <View
        style={styles.canvas}
        accessibilityLabel="Área para dibujar con el dedo"
        {...panResponder.panHandlers}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {strokes.map((stroke) => (
            <StrokeShape key={stroke.id} stroke={stroke} />
          ))}
          {current ? <StrokeShape stroke={current} /> : null}
        </Svg>
      </View>
    </ActivityFrame>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    justifyContent: 'center',
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.textPrimary,
  },
  modeChip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  modeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  modeChipTextSelected: {
    color: colors.onPrimary,
  },
});
