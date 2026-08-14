import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { softTap } from '@services/haptics/haptics';
import { createId } from '@shared/utils/id';

import { ActivityFrame } from '../components/ActivityFrame';
import { SENSORY_PALETTE } from '../data/activities';
import { useSensorySettings } from '../hooks/useSensorySettings';
import { BUBBLE_SPAWN_MS } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensoryBubbles'>;

interface Bubble {
  id: string;
  x: number;
  size: number;
  color: string;
  progress: Animated.Value;
}

const MAX_BUBBLES = 14;

/**
 * Burbujas que suben despacio y se revientan al tocarlas. Sin puntaje,
 * sin cronómetro y sin final: es una actividad de regulación, no un
 * juego que se gana. `Terminar` está siempre disponible (ver
 * `ActivityFrame`).
 *
 * Con `reduceMotion` las burbujas suben más lento todavía y aparecen
 * menos seguido, en vez de desaparecer la actividad por completo.
 */
export function BubblesScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings } = useSensorySettings(activeProfile?.id ?? null);
  const reduceMotion = activeProfile?.preferences.reduceMotion ?? false;

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [canvasHeight, setCanvasHeight] = useState(Dimensions.get('window').height);

  const spawnMs = BUBBLE_SPAWN_MS[settings.bubbleIntensity] * (reduceMotion ? 1.6 : 1);

  useEffect(() => {
    const width = Dimensions.get('window').width;

    const interval = setInterval(() => {
      const size = 44 + Math.random() * 46;
      const bubble: Bubble = {
        id: createId(),
        x: Math.random() * Math.max(0, width - size),
        size,
        color: SENSORY_PALETTE[Math.floor(Math.random() * SENSORY_PALETTE.length)],
        progress: new Animated.Value(0),
      };

      setBubbles((current) => {
        // Tope duro de burbujas en pantalla: por encima de esto deja de
        // ser calmante y pasa a ser ruido visual.
        const next = current.length >= MAX_BUBBLES ? current.slice(1) : current;
        return [...next, bubble];
      });

      const duration = (reduceMotion ? 14000 : 9000) + Math.random() * 3000;
      Animated.timing(bubble.progress, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setBubbles((current) => current.filter((item) => item.id !== bubble.id));
        }
      });
    }, spawnMs);

    return () => clearInterval(interval);
  }, [spawnMs, reduceMotion]);

  function popBubble(id: string) {
    softTap(settings.hapticsEnabled);
    setBubbles((current) => current.filter((bubble) => bubble.id !== id));
  }

  return (
    <ActivityFrame title="🫧 Burbujas" onFinish={() => navigation.goBack()}>
      <View
        style={styles.canvas}
        onLayout={(event) => setCanvasHeight(event.nativeEvent.layout.height)}
      >
        {bubbles.map((bubble) => (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubbleWrap,
              {
                left: bubble.x,
                width: bubble.size,
                height: bubble.size,
                transform: [
                  {
                    translateY: bubble.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [canvasHeight, -bubble.size],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              onPress={() => popBubble(bubble.id)}
              accessibilityRole="button"
              accessibilityLabel="Burbuja"
              accessibilityHint="Toca para reventarla"
              style={[
                styles.bubble,
                {
                  width: bubble.size,
                  height: bubble.size,
                  borderRadius: bubble.size / 2,
                  backgroundColor: bubble.color,
                },
              ]}
            />
          </Animated.View>
        ))}
      </View>
    </ActivityFrame>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  bubbleWrap: {
    position: 'absolute',
    top: 0,
  },
  bubble: {
    opacity: 0.75,
  },
});
