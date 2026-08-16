import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak } from '@services/audio/speech';
import { BigButton, ChildModeShell, EmptyState, useConfirmDialog } from '@shared/components';
import { useReduceMotion } from '@shared/hooks';
import { colors, minTouchTarget, radius, spacing, typography } from '@shared/theme';

import { useRoutines } from '../hooks/useRoutines';
import type { RoutineStep } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyDay'>;

/** "Mi Día": agenda visual de rutinas del perfil activo (Modo Niño). */
export function MyDayScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { routines, loading, toggleStepDone, resetRoutine } = useRoutines(
    activeProfile?.id ?? null,
  );
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const reduceMotion = useReduceMotion(activeProfile?.preferences.reduceMotion);
  const { confirm, dialog } = useConfirmDialog(reduceMotion);

  const selectedRoutine = routines.find((routine) => routine.id === selectedRoutineId) ?? null;
  const soundEnabled = activeProfile?.preferences.soundEnabled ?? true;

  function handleStepPress(step: RoutineStep) {
    if (soundEnabled) {
      speak(step.label);
    }
  }

  // R2: "Reiniciar rutina" borraba todo el progreso del día sin avisar —
  // era la única acción destructiva de toda la app sin ningún tipo de
  // confirmación (ni siquiera detrás de `confirmBeforeDelete`).
  async function handleResetRoutine(routineId: string) {
    const ok = await confirm({
      title: 'Reiniciar rutina',
      message: 'Todos los pasos marcados como hechos van a desmarcarse.',
      confirmLabel: 'Reiniciar',
      destructive: true,
    });
    if (ok) {
      resetRoutine(routineId);
    }
  }

  if (selectedRoutine) {
    const sortedSteps = [...selectedRoutine.steps].sort((a, b) => a.order - b.order);
    const nextStep = sortedSteps.find((step) => !step.done);

    return (
      <ChildModeShell scrollable>
        <View style={styles.header}>
          <BigButton
            label="Volver"
            variant="ghost"
            fullWidth={false}
            onPress={() => setSelectedRoutineId(null)}
          />
          <Text style={styles.title}>
            {selectedRoutine.emoji} {selectedRoutine.title}
          </Text>
        </View>

        {sortedSteps.length === 0 ? (
          <EmptyState emoji="🗓️" title="Esta rutina todavía no tiene pasos." />
        ) : (
          sortedSteps.map((step) => {
            const isNext = nextStep?.id === step.id;
            return (
              <Pressable
                key={step.id}
                onPress={() => handleStepPress(step)}
                accessibilityRole="button"
                accessibilityLabel={step.label}
                style={({ pressed }) => [
                  styles.stepRow,
                  step.done && styles.stepRowDone,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                {isNext ? <Text style={styles.stepBadge}>PRIMERO</Text> : null}
                {!isNext && !step.done && nextStep ? (
                  <Text style={styles.stepBadgeMuted}>DESPUÉS</Text>
                ) : null}
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
                <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
                  {step.label}
                </Text>
                <Pressable
                  onPress={() => toggleStepDone(selectedRoutine.id, step.id)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    step.done
                      ? `Marcar "${step.label}" como no hecho`
                      : `Marcar "${step.label}" como hecho`
                  }
                  style={[styles.doneButton, step.done && styles.doneButtonActive]}
                >
                  <Text style={styles.doneButtonText}>{step.done ? '✅' : 'Hecho'}</Text>
                </Pressable>
              </Pressable>
            );
          })
        )}

        <View style={styles.actions}>
          <BigButton
            label="Reiniciar rutina"
            variant="secondary"
            emoji="🔄"
            onPress={() => handleResetRoutine(selectedRoutine.id)}
          />
        </View>

        {dialog}
      </ChildModeShell>
    );
  }

  return (
    <ChildModeShell scrollable>
      <View style={styles.header}>
        <BigButton
          label="Volver"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>Mi Día</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : routines.length === 0 ? (
        <EmptyState
          emoji="🗓️"
          title="Todavía no hay rutinas."
          message="Un adulto puede crearlas en Centro de Adultos."
        />
      ) : (
        <View style={styles.grid}>
          {routines
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((routine) => {
              const total = routine.steps.length;
              const done = routine.steps.filter((step) => step.done).length;
              return (
                <Pressable
                  key={routine.id}
                  onPress={() => setSelectedRoutineId(routine.id)}
                  accessibilityRole="button"
                  accessibilityLabel={routine.title}
                  style={({ pressed }) => [
                    styles.routineCard,
                    { borderColor: routine.color, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.routineEmoji}>{routine.emoji}</Text>
                  <Text style={styles.routineTitle}>{routine.title}</Text>
                  <Text style={styles.routineProgress}>
                    {total === 0 ? 'Sin pasos' : `${done}/${total} pasos hechos`}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      )}
    </ChildModeShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  routineCard: {
    width: 150,
    minHeight: 130,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  routineEmoji: {
    fontSize: 36,
  },
  routineTitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  routineProgress: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  stepRowDone: {
    backgroundColor: colors.background,
    borderColor: colors.success,
  },
  stepBadge: {
    position: 'absolute',
    top: -10,
    left: spacing.sm,
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  stepBadgeMuted: {
    position: 'absolute',
    top: -10,
    left: spacing.sm,
    backgroundColor: colors.border,
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  stepEmoji: {
    fontSize: typography.sizes.xl,
  },
  stepLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  stepLabelDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  doneButton: {
    minHeight: minTouchTarget,
    minWidth: minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  doneButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  doneButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
