import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionRow } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { SensoryLayout } from '../components/SensoryLayout';
import { CalmWavesGame } from '../games/CalmWavesGame';
import { useSensoryRuntime } from '../hooks/useSensoryRuntime';
import type { SensoryStackParamList } from '../navigation/types';
import type { CalmWavesMode } from '../types';

type Props = NativeStackScreenProps<SensoryStackParamList, 'CalmWaves'>;

const MODE_OPTIONS: { value: CalmWavesMode; label: string }[] = [
  { value: 'water', label: '💧 Agua' },
  { value: 'stars', label: '⭐ Estrellas' },
  { value: 'circles', label: '⚪ Círculos' },
  { value: 'softLight', label: '🌤️ Luz suave' },
];

/** Juego 5: fondo relajante; cada toque deja ondas suaves. Sin objetivos ni puntuación. */
export function CalmWavesScreen({ navigation }: Props) {
  const runtime = useSensoryRuntime();
  const [showControls, setShowControls] = useState(false);
  const [mode, setMode] = useState<CalmWavesMode>('water');

  return (
    <SensoryLayout
      title="🌊 Ondas calmantes"
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
          <Text style={styles.controlsLabel}>Modo</Text>
          <OptionRow options={MODE_OPTIONS} value={mode} onChange={setMode} />
        </View>
      ) : null}

      <CalmWavesGame mode={mode} reduceMotion={runtime.reduceMotion} />
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
});
