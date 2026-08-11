import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton, OptionRow } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { SensoryLayout } from '../components/SensoryLayout';
import { MagicColorsGame } from '../games/MagicColorsGame';
import type { SensoryStackParamList } from '../navigation/types';
import type { MagicColorsPalette, MagicColorsShapeType } from '../types';

type Props = NativeStackScreenProps<SensoryStackParamList, 'MagicColors'>;

const SHAPE_OPTIONS: { value: MagicColorsShapeType; label: string }[] = [
  { value: 'circle', label: '⚪ Círculos' },
  { value: 'blob', label: '🫧 Manchas' },
];

const PALETTE_OPTIONS: { value: MagicColorsPalette; label: string }[] = [
  { value: 'soft', label: 'Colores suaves' },
  { value: 'vivid', label: 'Colores vivos' },
];

/** Juego 2: tocar o arrastrar el dedo deja círculos/manchas de color. Sin flashes. */
export function MagicColorsScreen({ navigation }: Props) {
  const [showControls, setShowControls] = useState(false);
  const [shapeType, setShapeType] = useState<MagicColorsShapeType>('circle');
  const [palette, setPalette] = useState<MagicColorsPalette>('soft');
  const [clearSignal, setClearSignal] = useState(0);

  return (
    <SensoryLayout
      title="🎨 Colores mágicos"
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
          <Text style={styles.controlsLabel}>Figura</Text>
          <OptionRow options={SHAPE_OPTIONS} value={shapeType} onChange={setShapeType} />
          <Text style={styles.controlsLabel}>Paleta</Text>
          <OptionRow options={PALETTE_OPTIONS} value={palette} onChange={setPalette} />
          <View style={styles.clearButton}>
            <BigButton
              label="Limpiar pantalla"
              emoji="🧹"
              variant="secondary"
              onPress={() => setClearSignal((current) => current + 1)}
            />
          </View>
        </View>
      ) : null}

      <MagicColorsGame shapeType={shapeType} palette={palette} clearSignal={clearSignal} />
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
  clearButton: {
    marginTop: spacing.sm,
  },
});
