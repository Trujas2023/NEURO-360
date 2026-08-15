import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { softTap } from '@services/haptics/haptics';
import { createId } from '@shared/utils/id';

import { ActivityFrame } from '../components/ActivityFrame';
import { SENSORY_PALETTE } from '../data/activities';
import { useSensorySettings } from '../hooks/useSensorySettings';

type Props = NativeStackScreenProps<RootStackParamList, 'SensoryAquarium'>;

interface Fish {
  id: string;
  y: number;
  color: string;
  fromLeft: boolean;
  progress: Animated.Value;
}

const FISH_WIDTH = 72;
const FISH_HEIGHT = 40;
const MAX_FISH = 10;
const SCREEN_WIDTH = Dimensions.get('window').width;

function FishShape({ color, faceLeft }: { color: string; faceLeft: boolean }) {
  return (
    <Svg
      width={FISH_WIDTH}
      height={FISH_HEIGHT}
      viewBox="0 0 72 40"
      style={faceLeft ? styles.flipped : undefined}
    >
      {/* Cuerpo y cola dentro del viewBox (x: 2-68, y: 4-36): fuera de ese
          rango el propio viewport del SVG lo recorta. */}
      <Ellipse cx="44" cy="20" rx="24" ry="16" fill={color} />
      <Path d="M20 20 L2 8 L2 32 Z" fill={color} />
      <Ellipse cx="54" cy="15" rx="3" ry="3" fill="#3A3A3A" />
    </Svg>
  );
}

/**
 * Acuario interactivo: cada toque hace aparecer un pez que nada de un
 * lado al otro de la pantalla y desaparece al llegar — sin nada que
 * alimentar de verdad, sin objetivos ni final. Puramente visual/táctil,
 * sin audio (a diferencia de "Sonidos y ritmo", acá el silencio es parte
 * de la actividad).
 */
export function SensoryAquariumScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings } = useSensorySettings(activeProfile?.id ?? null);
  const reduceMotion = activeProfile?.preferences.reduceMotion ?? false;

  const [fish, setFish] = useState<Fish[]>([]);

  function handleTouch(event: GestureResponderEvent) {
    const { locationY } = event.nativeEvent;
    const newFish: Fish = {
      id: createId(),
      y: locationY - FISH_HEIGHT / 2,
      color: SENSORY_PALETTE[Math.floor(Math.random() * SENSORY_PALETTE.length)],
      fromLeft: Math.random() < 0.5,
      progress: new Animated.Value(0),
    };

    softTap(settings.hapticsEnabled);
    setFish((current) => [...(current.length >= MAX_FISH ? current.slice(1) : current), newFish]);

    Animated.timing(newFish.progress, {
      toValue: 1,
      duration: reduceMotion ? 9000 : 5500,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setFish((current) => current.filter((item) => item.id !== newFish.id));
      }
    });
  }

  return (
    <ActivityFrame title="🐠 Acuario" onFinish={() => navigation.goBack()}>
      <Pressable
        onPress={handleTouch}
        accessibilityRole="button"
        accessibilityLabel="Acuario"
        accessibilityHint="Toca en cualquier parte para hacer aparecer un pez"
        style={styles.canvas}
      >
        {fish.map((item) => {
          const startX = item.fromLeft ? -FISH_WIDTH : SCREEN_WIDTH;
          const endX = item.fromLeft ? SCREEN_WIDTH : -FISH_WIDTH;
          return (
            <Animated.View
              key={item.id}
              pointerEvents="none"
              style={[
                styles.fishWrapper,
                {
                  top: item.y,
                  opacity: item.progress.interpolate({
                    inputRange: [0, 0.08, 0.85, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                  transform: [
                    {
                      translateX: item.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [startX, endX],
                      }),
                    },
                    {
                      translateY: item.progress.interpolate({
                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                        outputRange: [0, -10, 0, 10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <FishShape color={item.color} faceLeft={!item.fromLeft} />
            </Animated.View>
          );
        })}
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
  fishWrapper: {
    position: 'absolute',
    left: 0,
    width: FISH_WIDTH,
    height: FISH_HEIGHT,
  },
  flipped: {
    transform: [{ scaleX: -1 }],
  },
});
