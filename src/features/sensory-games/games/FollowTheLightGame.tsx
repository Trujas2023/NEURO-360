import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@shared/theme';

import { SOUND_ASSETS } from '../constants/soundAssets';
import { useSensoryFeedback } from '../hooks/useSensoryFeedback';
import type { FollowLightTrajectory } from '../types';

const LIGHT_SIZE = 64;

interface WanderState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  lastPickMs: number;
}

export interface FollowTheLightGameProps {
  trajectory: FollowLightTrajectory;
  /** Más alto = más lento (misma convención que el resto de Mundo Sensorial). */
  speedMultiplier: number;
  soundEnabled: boolean;
}

/** Objeto luminoso que se mueve lento por la pantalla; tocarlo da una pequeña animación y sonido opcional. */
export function FollowTheLightGame({ trajectory, speedMultiplier, soundEnabled }: FollowTheLightGameProps) {
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [position] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  const [scale] = useState(() => new Animated.Value(1));
  const { playSound } = useSensoryFeedback();
  const wanderRef = useRef<WanderState | null>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea({ width, height });
  };

  useEffect(() => {
    if (area.width === 0 || area.height === 0) {
      return;
    }

    const centerX = area.width / 2;
    const centerY = area.height / 2;
    const amplitudeX = Math.max(area.width / 2 - LIGHT_SIZE, 20);
    const amplitudeY = Math.max(area.height / 2 - LIGHT_SIZE, 20);
    const angularSpeed = 0.0007 / speedMultiplier;
    const start = Date.now();
    wanderRef.current = { x: centerX, y: centerY, targetX: centerX, targetY: centerY, lastPickMs: 0 };
    let frame: number;

    function tick() {
      const elapsed = Date.now() - start;
      let x = centerX;
      let y = centerY;

      if (trajectory === 'horizontal') {
        x = centerX + amplitudeX * Math.sin(elapsed * angularSpeed);
      } else if (trajectory === 'vertical') {
        y = centerY + amplitudeY * Math.sin(elapsed * angularSpeed);
      } else if (trajectory === 'circular') {
        const radiusPx = Math.min(amplitudeX, amplitudeY);
        x = centerX + radiusPx * Math.cos(elapsed * angularSpeed);
        y = centerY + radiusPx * Math.sin(elapsed * angularSpeed);
      } else {
        const wander = wanderRef.current;
        if (wander) {
          if (elapsed - wander.lastPickMs > 3200 * speedMultiplier) {
            wander.targetX = centerX + (Math.random() - 0.5) * 2 * amplitudeX;
            wander.targetY = centerY + (Math.random() - 0.5) * 2 * amplitudeY;
            wander.lastPickMs = elapsed;
          }
          wander.x += (wander.targetX - wander.x) * (0.015 / speedMultiplier);
          wander.y += (wander.targetY - wander.y) * (0.015 / speedMultiplier);
          x = wander.x;
          y = wander.y;
        }
      }

      position.setValue({ x, y });
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [area.width, area.height, trajectory, speedMultiplier, position]);

  function handlePress() {
    playSound(SOUND_ASSETS.sparkle, soundEnabled, 0.6);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.5, duration: 180, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }

  return (
    <View style={styles.area} onLayout={handleLayout}>
      {area.width > 0 ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.light,
            {
              transform: [
                { translateX: Animated.subtract(position.x, LIGHT_SIZE / 2) },
                { translateY: Animated.subtract(position.y, LIGHT_SIZE / 2) },
                { scale },
              ],
            },
          ]}
        >
          <Pressable
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel="Luz"
            accessibilityHint="Tócala cuando la alcances"
            style={styles.lightTouchable}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: '#20223B',
    overflow: 'hidden',
  },
  light: {
    position: 'absolute',
    width: LIGHT_SIZE,
    height: LIGHT_SIZE,
  },
  lightTouchable: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.warning,
    shadowColor: colors.warning,
    shadowOpacity: 0.9,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
});
