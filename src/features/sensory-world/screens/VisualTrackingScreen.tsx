import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { softTap } from '@services/haptics/haptics';
import { colors, spacing } from '@shared/theme';

import { ActivityFrame } from '../components/ActivityFrame';
import { useSensorySettings } from '../hooks/useSensorySettings';
import { TRACKING_DURATION_MS } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensoryTracking'>;

const OBJECT_SIZE = 72;

/**
 * Objeto suave que cruza la pantalla de lado a lado a velocidad
 * constante, para acompañar el seguimiento visual. Velocidad y color los
 * elige un adulto en los ajustes.
 *
 * El movimiento es lineal y siempre en el mismo recorrido a propósito:
 * es predecible, que es justo lo que lo hace seguible. Tocarlo da un
 * toque háptico suave, sin puntaje ni penalización por errar.
 */
export function VisualTrackingScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings } = useSensorySettings(activeProfile?.id ?? null);
  const reduceMotion = activeProfile?.preferences.reduceMotion ?? false;

  const [progress] = useState(() => new Animated.Value(0));
  const [canvasWidth, setCanvasWidth] = useState(0);

  const duration = TRACKING_DURATION_MS[settings.trackingSpeed] * (reduceMotion ? 1.5 : 1);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [duration, progress]);

  const travel = Math.max(0, canvasWidth - OBJECT_SIZE - spacing.md * 2);

  return (
    <ActivityFrame title="👀 Sigue el color" onFinish={() => navigation.goBack()}>
      <View style={styles.canvas} onLayout={(event) => setCanvasWidth(event.nativeEvent.layout.width)}>
        <Animated.View
          style={[
            styles.mover,
            { transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, travel] }) }] },
          ]}
        >
          <Pressable
            onPress={() => softTap(settings.hapticsEnabled)}
            accessibilityRole="button"
            accessibilityLabel="Objeto en movimiento"
            accessibilityHint="Puedes tocarlo mientras se mueve"
            style={[styles.object, { backgroundColor: settings.trackingColor }]}
          />
        </Animated.View>
      </View>
    </ActivityFrame>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  mover: {
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
  },
  object: {
    width: OBJECT_SIZE,
    height: OBJECT_SIZE,
    borderRadius: OBJECT_SIZE / 2,
    opacity: 0.85,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
