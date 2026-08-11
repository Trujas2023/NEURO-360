import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton, OptionRow } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { SensoryLayout } from '../components/SensoryLayout';
import { ToggleIconButton } from '../components/ToggleIconButton';
import { DRAWING_COLORS, DRAWING_THICKNESS_OPTIONS } from '../constants/drawingColors';
import { SensoryDrawingGame } from '../games/SensoryDrawingGame';
import type { SensoryStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SensoryStackParamList, 'SensoryDrawing'>;

/** Juego 6: lienzo táctil. No pide registro ni guarda el dibujo automáticamente. */
export function SensoryDrawingScreen({ navigation }: Props) {
  const [showControls, setShowControls] = useState(false);
  const [color, setColor] = useState(DRAWING_COLORS[0]);
  const [thickness, setThickness] = useState(DRAWING_THICKNESS_OPTIONS[1].value);
  const [glowEnabled, setGlowEnabled] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);
  const isEraser = color === colors.surface;

  return (
    <SensoryLayout
      title="🖌️ Dibujo sensorial"
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
          <Text style={styles.controlsLabel}>Color</Text>
          <View style={styles.swatchRow}>
            {DRAWING_COLORS.map((swatch) => (
              <Pressable
                key={swatch}
                onPress={() => setColor(swatch)}
                accessibilityRole="button"
                accessibilityLabel={`Elegir color ${swatch}`}
                accessibilityState={{ selected: swatch === color }}
                style={[styles.swatch, { backgroundColor: swatch }, swatch === color && styles.swatchSelected]}
              />
            ))}
            <Pressable
              onPress={() => setColor(colors.surface)}
              accessibilityRole="button"
              accessibilityLabel="Borrador"
              accessibilityState={{ selected: isEraser }}
              style={[styles.eraserButton, isEraser && styles.swatchSelected]}
            >
              <Text style={styles.eraserIcon}>🧽</Text>
            </Pressable>
          </View>

          <Text style={styles.controlsLabel}>Grosor</Text>
          <OptionRow options={DRAWING_THICKNESS_OPTIONS} value={thickness} onChange={setThickness} />

          <View style={styles.bottomRow}>
            <ToggleIconButton
              label="Brillo"
              iconOn="✨"
              iconOff="⚪"
              value={glowEnabled}
              onToggle={setGlowEnabled}
            />
            <View style={styles.bottomSpacer} />
            <BigButton
              label="Limpiar pantalla"
              emoji="🧹"
              variant="secondary"
              fullWidth={false}
              onPress={() => setClearSignal((current) => current + 1)}
            />
          </View>
        </View>
      ) : null}

      <SensoryDrawingGame color={color} strokeWidth={thickness} glowEnabled={glowEnabled} clearSignal={clearSignal} />
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
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.textPrimary,
  },
  eraserButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  eraserIcon: {
    fontSize: typography.sizes.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  bottomSpacer: {
    width: spacing.sm,
  },
});
