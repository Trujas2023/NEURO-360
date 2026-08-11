import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@shared/theme';
import { createId } from '@shared/utils/id';

import { useSensoryFeedback } from '../hooks/useSensoryFeedback';

const BUBBLE_COLORS = [colors.accent, colors.primary, colors.blush, colors.lavender, colors.secondary];
const MIN_BUBBLE_SIZE = 48;
const MAX_BUBBLE_SIZE = 92;

interface BubbleDescriptor {
  id: string;
  size: number;
  left: number;
  color: string;
  durationMs: number;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createBubble(areaWidth: number, baseDurationMs: number): BubbleDescriptor {
  const size = randomBetween(MIN_BUBBLE_SIZE, MAX_BUBBLE_SIZE);
  return {
    id: createId(),
    size,
    left: randomBetween(0, Math.max(areaWidth - size, 0)),
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    durationMs: baseDurationMs * randomBetween(0.85, 1.25),
  };
}

interface BubbleProps {
  descriptor: BubbleDescriptor;
  areaHeight: number;
  onPop: () => void;
}

function Bubble({ descriptor, areaHeight, onPop }: BubbleProps) {
  const [translateY] = useState(() => new Animated.Value(areaHeight + descriptor.size));
  const [scale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(1));
  const poppedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function rise() {
      if (cancelled) {
        return;
      }
      translateY.setValue(areaHeight + descriptor.size);
      Animated.timing(translateY, {
        toValue: -descriptor.size,
        duration: descriptor.durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) {
          rise();
        }
      });
    }

    rise();
    return () => {
      cancelled = true;
      translateY.stopAnimation();
    };
  }, [areaHeight, descriptor.size, descriptor.durationMs, translateY]);

  function handlePress() {
    if (poppedRef.current) {
      return;
    }
    poppedRef.current = true;
    translateY.stopAnimation();
    Animated.parallel([
      Animated.timing(scale, { toValue: 1.4, duration: 160, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => onPop());
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.bubble,
        {
          width: descriptor.size,
          height: descriptor.size,
          borderRadius: descriptor.size / 2,
          left: descriptor.left,
          backgroundColor: descriptor.color,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Burbuja"
        accessibilityHint="Toca para reventarla"
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export interface BubblesGameProps {
  bubbleCount: number;
  /** Duración base (ms) para cruzar la pantalla; más alto = más lento. */
  baseDurationMs: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

/** Burbujas de distinto tamaño que suben lentamente; tocarlas las revienta y aparece una nueva. */
export function BubblesGame({ bubbleCount, baseDurationMs, soundEnabled, vibrationEnabled }: BubblesGameProps) {
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [bubbles, setBubbles] = useState<BubbleDescriptor[]>([]);
  const { playCue, vibrate } = useSensoryFeedback();

  const areaRef = useRef(area);
  useEffect(() => {
    areaRef.current = area;
  }, [area]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea({ width, height });
  }, []);

  // Ajusta la cantidad de burbujas cuando cambia el área medida o la
  // cantidad pedida, siguiendo el patrón de React para derivar estado a
  // partir de props/valores que cambian (en vez de un efecto): se
  // compara con la última combinación ya aplicada y, si difiere, se
  // actualiza durante el propio render.
  const layoutKey = `${area.width}x${area.height}x${bubbleCount}`;
  const [appliedLayoutKey, setAppliedLayoutKey] = useState('');
  if (area.width > 0 && area.height > 0 && layoutKey !== appliedLayoutKey) {
    setAppliedLayoutKey(layoutKey);
    setBubbles((current) => {
      if (current.length === bubbleCount) {
        return current;
      }
      if (current.length > bubbleCount) {
        return current.slice(0, bubbleCount);
      }
      const next = [...current];
      while (next.length < bubbleCount) {
        next.push(createBubble(area.width, baseDurationMs));
      }
      return next;
    });
  }

  function handlePop(id: string) {
    playCue('pop', soundEnabled, 0.6);
    vibrate(vibrationEnabled);
    setBubbles((current) => [
      ...current.filter((bubble) => bubble.id !== id),
      createBubble(areaRef.current.width, baseDurationMs),
    ]);
  }

  return (
    <View style={styles.area} onLayout={handleLayout}>
      {area.width > 0 &&
        bubbles.map((bubble) => (
          <Bubble key={bubble.id} descriptor={bubble} areaHeight={area.height} onPop={() => handlePop(bubble.id)} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    top: 0,
    borderRadius: radius.pill,
  },
});
