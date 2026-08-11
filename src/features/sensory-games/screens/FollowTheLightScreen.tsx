import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionRow } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { SensoryLayout } from '../components/SensoryLayout';
import { ToggleIconButton } from '../components/ToggleIconButton';
import { ANIMATION_SPEED_MULTIPLIER } from '../constants/games';
import { FollowTheLightGame } from '../games/FollowTheLightGame';
import { useSensoryRuntime } from '../hooks/useSensoryRuntime';
import type { SensoryStackParamList } from '../navigation/types';
import type { AnimationSpeed, FollowLightTrajectory } from '../types';

type Props = NativeStackScreenProps<SensoryStackParamList, 'FollowTheLight'>;

const SPEED_OPTIONS: { value: AnimationSpeed; label: string }[] = [
  { value: 'slow', label: 'Lento' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Ligeramente rápido' },
];

const TRAJECTORY_OPTIONS: { value: FollowLightTrajectory; label: string }[] = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'circular', label: 'Circular' },
  { value: 'random', label: 'Aleatoria suave' },
];

/** Juego 3: una luz se mueve lento por la pantalla; tocarla da una pequeña animación. */
export function FollowTheLightScreen({ navigation }: Props) {
  const runtime = useSensoryRuntime();
  const [showControls, setShowControls] = useState(false);
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [trajectory, setTrajectory] = useState<FollowLightTrajectory>('circular');
  const [soundOn, setSoundOn] = useState(runtime.soundEnabled);

  return (
    <SensoryLayout
      title="✨ Sigue la luz"
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
          <Text style={styles.controlsLabel}>Trayectoria</Text>
          <OptionRow options={TRAJECTORY_OPTIONS} value={trajectory} onChange={setTrajectory} />
          <View style={styles.toggleRow}>
            <ToggleIconButton label="Sonido" iconOn="🔊" iconOff="🔇" value={soundOn} onToggle={setSoundOn} />
          </View>
        </View>
      ) : null}

      <FollowTheLightGame
        trajectory={trajectory}
        speedMultiplier={ANIMATION_SPEED_MULTIPLIER[speed]}
        soundEnabled={soundOn}
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
});
