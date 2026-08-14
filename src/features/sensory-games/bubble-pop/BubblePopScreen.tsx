import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useRef, useState } from 'react';
import { Animated, type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';
import { createId } from '@shared/utils/id';

import type { SensoryGamesStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SensoryGamesStackParamList, 'BubblePop'>;

const BUBBLE_COUNT = 8;
const BUBBLE_SIZE = 88;
const BUBBLE_COLORS = [
  colors.accent,
  colors.secondary,
  colors.lavender,
  colors.blush,
  colors.primary,
];

interface Bubble {
  id: string;
  x: number;
  y: number;
  color: string;
  scale: Animated.Value;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function createBubble(width: number, height: number): Bubble {
  return {
    id: createId(),
    x: randomBetween(0, Math.max(width - BUBBLE_SIZE, 0)),
    y: randomBetween(0, Math.max(height - BUBBLE_SIZE, 0)),
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    scale: new Animated.Value(0),
  };
}

/**
 * "Revienta burbujas": primer juego sensorial (Fase 6). Sin puntaje que
 * penalice, sin límite de tiempo y sin sonido (no se agrega ninguna
 * dependencia de audio nueva): el objetivo es la regulación por
 * estimulación táctil/visual repetitiva, no competir. Cada burbuja
 * reventada reaparece sola en una posición nueva.
 */
export function BubblePopScreen({ navigation }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState(0);
  const layoutRef = useRef({ width: 0, height: 0 });
  const seeded = useRef(false);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    layoutRef.current = { width, height };
    if (!seeded.current && width > 0 && height > 0) {
      seeded.current = true;
      const initial = Array.from({ length: BUBBLE_COUNT }, () => createBubble(width, height));
      setBubbles(initial);
      initial.forEach((bubble) => {
        Animated.spring(bubble.scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
      });
    }
  }, []);

  const popBubble = useCallback((bubbleId: string) => {
    setBubbles((current) => {
      const bubble = current.find((item) => item.id === bubbleId);
      if (!bubble) {
        return current;
      }
      Animated.timing(bubble.scale, { toValue: 0, duration: 220, useNativeDriver: true }).start(
        () => {
          setPopped((count) => count + 1);
          setBubbles((next) => {
            const { width, height } = layoutRef.current;
            const replacement = createBubble(width, height);
            Animated.spring(replacement.scale, {
              toValue: 1,
              useNativeDriver: true,
              friction: 5,
            }).start();
            return next.map((item) => (item.id === bubbleId ? replacement : item));
          });
        },
      );
      return current;
    });
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <BigButton
          label="Volver"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.counter}>🫧 {popped}</Text>
      </View>

      <Text style={styles.title}>Revienta burbujas</Text>
      <Text style={styles.subtitle}>Toca las burbujas, tantas veces como quieras</Text>

      <View style={styles.playArea} onLayout={handleLayout}>
        {bubbles.map((bubble) => (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubble,
              {
                left: bubble.x,
                top: bubble.y,
                backgroundColor: bubble.color,
                transform: [{ scale: bubble.scale }],
              },
            ]}
          >
            <Pressable
              onPress={() => popBubble(bubble.id)}
              accessibilityRole="button"
              accessibilityLabel="Burbuja"
              accessibilityHint="Tócala para reventarla"
              style={styles.bubbleTouchable}
            />
          </Animated.View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  playArea: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
  },
  bubbleTouchable: {
    flex: 1,
    borderRadius: BUBBLE_SIZE / 2,
  },
});
