import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { AudioSource } from 'expo-audio';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { playTone } from '@services/audio';
import { softTap } from '@services/haptics/haptics';
import { radius, spacing } from '@shared/theme';

import { ActivityFrame } from '../components/ActivityFrame';
import { SENSORY_PALETTE } from '../data/activities';
import { useSensorySettings } from '../hooks/useSensorySettings';

type Props = NativeStackScreenProps<RootStackParamList, 'SensorySoundRhythm'>;

/**
 * Notas propias, sintetizadas por código (escala pentatónica de Do, sin
 * ninguna grabación de terceros — ver el comentario de
 * `SensoryActivityId` en `../types.ts`). Suenan bien tocadas en cualquier
 * orden, así que no hay forma de "tocar mal".
 */
const PADS: { source: AudioSource; color: string; label: string }[] = [
  { source: require('@assets/sounds/tone_c4.wav'), color: SENSORY_PALETTE[0], label: 'Nota do' },
  { source: require('@assets/sounds/tone_d4.wav'), color: SENSORY_PALETTE[1], label: 'Nota re' },
  { source: require('@assets/sounds/tone_e4.wav'), color: SENSORY_PALETTE[2], label: 'Nota mi' },
  { source: require('@assets/sounds/tone_g4.wav'), color: SENSORY_PALETTE[3], label: 'Nota sol' },
  { source: require('@assets/sounds/tone_a4.wav'), color: SENSORY_PALETTE[4], label: 'Nota la' },
  { source: require('@assets/sounds/tone_c5.wav'), color: SENSORY_PALETTE[5], label: 'Nota do agudo' },
];

/**
 * "Sonidos y ritmo": tocar cualquier pastilla suena una nota y la hace
 * pulsar. Sin secuencia que memorizar, sin puntaje, sin orden correcto —
 * es un instrumento simple, no un juego de memoria (eso ya existe en
 * Juega & Regula).
 */
export function SensorySoundRhythmScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings } = useSensorySettings(activeProfile?.id ?? null);
  const reduceMotion = activeProfile?.preferences.reduceMotion ?? false;

  return (
    <ActivityFrame title="🎵 Sonidos y ritmo" onFinish={() => navigation.goBack()}>
      <View style={styles.grid}>
        {PADS.map((pad, index) => (
          <Pad
            key={index}
            source={pad.source}
            color={pad.color}
            label={pad.label}
            hapticsEnabled={settings.hapticsEnabled}
            reduceMotion={reduceMotion}
          />
        ))}
      </View>
    </ActivityFrame>
  );
}

function Pad({
  source,
  color,
  label,
  hapticsEnabled,
  reduceMotion,
}: {
  source: AudioSource;
  color: string;
  label: string;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
}) {
  const [scale] = useState(() => new Animated.Value(1));

  function handlePress() {
    playTone(source);
    softTap(hapticsEnabled);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: reduceMotion ? 1.05 : 1.15,
        duration: reduceMotion ? 120 : 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: reduceMotion ? 260 : 180,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.padWrapper}
    >
      <Animated.View style={[styles.pad, { backgroundColor: color, transform: [{ scale }] }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  padWrapper: {
    width: '40%',
    aspectRatio: 1,
  },
  pad: {
    flex: 1,
    borderRadius: radius.lg,
  },
});
