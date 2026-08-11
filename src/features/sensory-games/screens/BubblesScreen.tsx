import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionRow } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { SensoryLayout } from '../components/SensoryLayout';
import { ToggleIconButton } from '../components/ToggleIconButton';
import { ANIMATION_SPEED_MULTIPLIER } from '../constants/games';
import { BubblesGame } from '../games/BubblesGame';
import { useSensoryRuntime } from '../hooks/useSensoryRuntime';
import type { SensoryStackParamList } from '../navigation/types';
import type { AnimationSpeed } from '../types';

type Props = NativeStackScreenProps<SensoryStackParamList, 'Bubbles'>;

const SPEED_OPTIONS: { value: AnimationSpeed; label: string }[] = [
  { value: 'slow', label: 'Lento' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Rápido' },
];

const COUNT_OPTIONS: { value: number; label: string }[] = [
  { value: 4, label: 'Pocas' },
  { value: 7, label: 'Medias' },
  { value: 11, label: 'Muchas' },
];

const BASE_DURATION_MS = 6000;

/** Juego 1: burbujas que suben lentamente; tocarlas las revienta. Sin puntuación. */
export function BubblesScreen({ navigation }: Props) {
  const runtime = useSensoryRuntime();
  const [showControls, setShowControls] = useState(false);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [count, setCount] = useState(runtime.maxElements);
  const [soundOn, setSoundOn] = useState(runtime.soundEnabled);
  const [vibrationOn, setVibrationOn] = useState(runtime.vibrationEnabled);

  return (
    <SensoryLayout
      title="🫧 Burbujas"
      onBack={() => navigation.goBack()}
      headerRight={
        <Pressable
          onPress={() => setShowControls((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel="Mostrar u ocultar ajustes del juego"
          style={styles.gearButton}
        >
          <Text style={styles.gearIcon}>⚙️</Text>
        </Pressable>
      }
    >
      {showControls ? (
        <View style={styles.controls}>
          <Text style={styles.controlsLabel}>Velocidad</Text>
          <OptionRow options={SPEED_OPTIONS} value={speed} onChange={setSpeed} />
          <Text style={styles.controlsLabel}>Cantidad</Text>
          <OptionRow options={COUNT_OPTIONS} value={count} onChange={setCount} />
          <View style={styles.toggleRow}>
            <ToggleIconButton label="Sonido" iconOn="🔊" iconOff="🔇" value={soundOn} onToggle={setSoundOn} />
            <View style={styles.toggleSpacer} />
            <ToggleIconButton
              label="Vibración"
              iconOn="📳"
              iconOff="📴"
              value={vibrationOn}
              onToggle={setVibrationOn}
            />
          </View>
        </View>
      ) : null}

      <BubblesGame
        bubbleCount={count}
        baseDurationMs={BASE_DURATION_MS * ANIMATION_SPEED_MULTIPLIER[speed]}
        soundEnabled={soundOn}
        vibrationEnabled={vibrationOn}
      />
    </SensoryLayout>
  );
}

const styles = StyleSheet.create({
  gearButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: typography.sizes.lg,
  },
  controls: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  controlsLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  toggleSpacer: {
    width: spacing.sm,
  },
});
