import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AacCardVisual } from '@features/aac-communicator/components/AacCardVisual';
import { colors, radius, spacing, touchTargets, typography } from '@shared/theme';

import { VisualTimer } from './VisualTimer';
import type { RoutineStep } from '../types';

interface BaseStepProps {
  step: RoutineStep;
  /** Etiqueta de posición: PRIMERO / DESPUÉS / AHORA / TERMINADO. */
  badge?: string;
  badgeMuted?: boolean;
  onSpeak: () => void;
  onToggle?: () => void;
}

/**
 * Paso en formato grande, para los modos que muestran uno solo a la vez
 * (PRIMERO/DESPUÉS y AHORA). Es donde aparece el temporizador visual, si
 * el paso tiene duración: no tiene sentido mostrar varios relojes a la vez.
 */
export function StepPanel({
  step,
  badge,
  badgeMuted = false,
  onSpeak,
  onToggle,
  reduceMotion,
}: BaseStepProps & { reduceMotion?: boolean }) {
  return (
    <View style={[styles.panel, step.done && styles.panelDone]}>
      {badge ? <Text style={[styles.badge, badgeMuted && styles.badgeMuted]}>{badge}</Text> : null}

      <Pressable
        onPress={onSpeak}
        accessibilityRole="button"
        accessibilityLabel={step.label}
        accessibilityHint="Toca para escuchar este paso"
        style={({ pressed }) => [styles.panelBody, { opacity: pressed ? 0.85 : 1 }]}
      >
        <AacCardVisual emoji={step.emoji} imageUri={step.imageUri} size={88} />
        <Text style={[styles.panelLabel, step.done && styles.labelDone]}>{step.label}</Text>
      </Pressable>

      {step.durationSeconds ? (
        <VisualTimer key={step.id} durationSeconds={step.durationSeconds} reduceMotion={reduceMotion} />
      ) : null}

      {onToggle ? (
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={step.done ? `Marcar "${step.label}" como no hecho` : `Marcar "${step.label}" como hecho`}
          style={({ pressed }) => [
            styles.panelDoneButton,
            step.done && styles.doneButtonActive,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.panelDoneButtonText}>{step.done ? '✅ Hecho' : 'Hecho'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Paso en formato compacto, para listas (modo lista y las secciones secundarias). */
export function StepRow({ step, badge, badgeMuted = false, onSpeak, onToggle }: BaseStepProps) {
  return (
    <View style={[styles.row, step.done && styles.rowDone]}>
      {badge ? <Text style={[styles.badge, badgeMuted && styles.badgeMuted]}>{badge}</Text> : null}

      <Pressable
        onPress={onSpeak}
        accessibilityRole="button"
        accessibilityLabel={step.label}
        accessibilityHint="Toca para escuchar este paso"
        style={({ pressed }) => [styles.rowBody, { opacity: pressed ? 0.85 : 1 }]}
      >
        <AacCardVisual emoji={step.emoji} imageUri={step.imageUri} size={36} />
        <Text style={[styles.rowLabel, step.done && styles.labelDone]} numberOfLines={2}>
          {step.label}
        </Text>
      </Pressable>

      {onToggle ? (
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={step.done ? `Marcar "${step.label}" como no hecho` : `Marcar "${step.label}" como hecho`}
          style={[styles.rowDoneButton, step.done && styles.doneButtonActive]}
        >
          <Text style={styles.rowDoneButtonText}>{step.done ? '✅' : 'Hecho'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  panelDone: {
    borderColor: colors.success,
  },
  panelBody: {
    alignItems: 'center',
  },
  panelLabel: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  panelDoneButton: {
    marginTop: spacing.md,
    minHeight: touchTargets.comfortable,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelDoneButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowDone: {
    backgroundColor: colors.background,
    borderColor: colors.success,
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  rowDoneButton: {
    minHeight: touchTargets.minimum,
    minWidth: touchTargets.minimum,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  rowDoneButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  doneButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  labelDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  badgeMuted: {
    backgroundColor: colors.border,
    color: colors.textSecondary,
  },
});
