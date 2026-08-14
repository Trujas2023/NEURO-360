import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { softTap } from '@services/haptics/haptics';
import { createId } from '@shared/utils/id';

import { ActivityFrame } from '../components/ActivityFrame';
import { SENSORY_PALETTE } from '../data/activities';
import { useSensorySettings } from '../hooks/useSensorySettings';

type Props = NativeStackScreenProps<RootStackParamList, 'SensoryCauseEffect'>;

type BurstShape = 'circle' | 'square' | 'diamond';

interface Burst {
  id: string;
  x: number;
  y: number;
  color: string;
  shape: BurstShape;
  progress: Animated.Value;
}

const SHAPES: BurstShape[] = ['circle', 'square', 'diamond'];
const BURST_SIZE = 96;
const MAX_BURSTS = 12;

/**
 * Causa y efecto: cada toque produce una forma que crece y se desvanece
 * donde el dedo tocó, más una vibración suave. Sin objetivos, sin
 * errores posibles y sin nada que perder: la relación entre "toco" y
 * "pasa algo" es el contenido completo de la actividad.
 */
export function CauseEffectScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings } = useSensorySettings(activeProfile?.id ?? null);
  const reduceMotion = activeProfile?.preferences.reduceMotion ?? false;

  const [bursts, setBursts] = useState<Burst[]>([]);

  function handleTouch(event: GestureResponderEvent) {
    const { locationX, locationY } = event.nativeEvent;
    const burst: Burst = {
      id: createId(),
      x: locationX - BURST_SIZE / 2,
      y: locationY - BURST_SIZE / 2,
      color: SENSORY_PALETTE[Math.floor(Math.random() * SENSORY_PALETTE.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      progress: new Animated.Value(0),
    };

    softTap(settings.hapticsEnabled);
    setBursts((current) => [...(current.length >= MAX_BURSTS ? current.slice(1) : current), burst]);

    Animated.timing(burst.progress, {
      toValue: 1,
      duration: reduceMotion ? 1100 : 800,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setBursts((current) => current.filter((item) => item.id !== burst.id));
      }
    });
  }

  return (
    <ActivityFrame title="✨ Toca y mira" onFinish={() => navigation.goBack()}>
      <Pressable
        onPress={handleTouch}
        accessibilityRole="button"
        accessibilityLabel="Área para tocar"
        accessibilityHint="Toca en cualquier parte para hacer aparecer una forma"
        style={styles.canvas}
      >
        {bursts.map((burst) => (
          <Animated.View
            key={burst.id}
            pointerEvents="none"
            style={[
              styles.burst,
              burst.shape === 'circle' && styles.circle,
              burst.shape === 'diamond' && styles.diamond,
              {
                left: burst.x,
                top: burst.y,
                backgroundColor: burst.color,
                opacity: burst.progress.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.7, 0] }),
                transform: [
                  { rotate: burst.shape === 'diamond' ? '45deg' : '0deg' },
                  { scale: burst.progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.4] }) },
                ],
              },
            ]}
          />
        ))}
        <View pointerEvents="none" style={styles.spacer} />
      </Pressable>
    </ActivityFrame>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  burst: {
    position: 'absolute',
    width: BURST_SIZE,
    height: BURST_SIZE,
  },
  circle: {
    borderRadius: BURST_SIZE / 2,
  },
  diamond: {
    borderRadius: 12,
  },
});
