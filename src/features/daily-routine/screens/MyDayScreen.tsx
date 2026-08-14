import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak, speakOptionsForPreferences } from '@services/audio/speech';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { RoutineComplete } from '../components/RoutineComplete';
import { StepPanel, StepRow } from '../components/StepViews';
import { useRoutines } from '../hooks/useRoutines';
import type { DailyRoutine, RoutineStep } from '../types';

/**
 * "Mi Día": agenda visual de rutinas del perfil activo (Modo Niño). Es la
 * raíz del tab "Mi Día" de `MainTabs`, así que no tiene botón "Volver" al
 * nivel de lista (se cambia de tab con la barra inferior); sí lo tiene la
 * vista de una rutina, que vuelve a la lista (estado local, no navegación).
 *
 * Cada rutina se presenta según su `displayMode`, que configura un adulto:
 * lista completa, tablero PRIMERO/DESPUÉS, o AHORA/DESPUÉS/TERMINADO.
 */
export function MyDayScreen() {
  const { activeProfile } = useProfiles();
  const { routines, loading, toggleStepDone, resetRoutine } = useRoutines(activeProfile?.id ?? null);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  const selectedRoutine = routines.find((routine) => routine.id === selectedRoutineId) ?? null;
  const soundEnabled = activeProfile?.preferences.soundEnabled ?? true;
  const reduceMotion = activeProfile?.preferences.reduceMotion ?? false;
  const ttsOptions = speakOptionsForPreferences(activeProfile?.preferences);

  function speakStep(step: RoutineStep) {
    if (soundEnabled) {
      speak(step.label, ttsOptions);
    }
  }

  /**
   * Marca/desmarca un paso y, si con esto se completa la rutina entera,
   * dispara el refuerzo sonoro. Va acá y no en un efecto de
   * `RoutineComplete` para que suene exactamente una vez, en la
   * transición, y no en cada render con la rutina ya terminada.
   */
  function toggleStep(routine: DailyRoutine, step: RoutineStep) {
    const pendingCount = routine.steps.filter((item) => !item.done).length;
    const willCompleteRoutine = !step.done && pendingCount === 1;

    toggleStepDone(routine.id, step.id);

    if (willCompleteRoutine && soundEnabled) {
      speak('¡Muy bien! Terminaste toda la rutina.', ttsOptions);
    }
  }

  if (selectedRoutine) {
    const sortedSteps = [...selectedRoutine.steps].sort((a, b) => a.order - b.order);
    const pendingSteps = sortedSteps.filter((step) => !step.done);
    const doneSteps = sortedSteps.filter((step) => step.done);
    const currentStep = pendingSteps[0] ?? null;
    const nextStep = pendingSteps[1] ?? null;
    const allDone = sortedSteps.length > 0 && pendingSteps.length === 0;
    const mode = selectedRoutine.displayMode ?? 'list';

    return (
      <ScreenContainer scrollable topInset={false}>
        <View style={styles.header}>
          <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => setSelectedRoutineId(null)} />
          <Text style={styles.title}>
            {selectedRoutine.emoji} {selectedRoutine.title}
          </Text>
        </View>

        {allDone ? <RoutineComplete reduceMotion={reduceMotion} /> : null}

        {sortedSteps.length === 0 ? <Text style={styles.empty}>Esta rutina todavía no tiene pasos.</Text> : null}

        {mode === 'list'
          ? sortedSteps.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                badge={currentStep?.id === step.id ? 'PRIMERO' : !step.done && currentStep ? 'DESPUÉS' : undefined}
                badgeMuted={currentStep?.id !== step.id}
                onSpeak={() => speakStep(step)}
                onToggle={() => toggleStep(selectedRoutine, step)}
              />
            ))
          : null}

        {mode === 'firstThen' ? (
          <View>
            {currentStep ? (
              <StepPanel
                step={currentStep}
                badge="PRIMERO"
                onSpeak={() => speakStep(currentStep)}
                onToggle={() => toggleStep(selectedRoutine, currentStep)}
                reduceMotion={reduceMotion}
              />
            ) : null}
            {nextStep ? (
              <StepPanel step={nextStep} badge="DESPUÉS" badgeMuted onSpeak={() => speakStep(nextStep)} />
            ) : null}
          </View>
        ) : null}

        {mode === 'nowNextDone' ? (
          <View>
            {currentStep ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AHORA</Text>
                <StepPanel
                  step={currentStep}
                  onSpeak={() => speakStep(currentStep)}
                  onToggle={() => toggleStep(selectedRoutine, currentStep)}
                  reduceMotion={reduceMotion}
                />
              </View>
            ) : null}

            {pendingSteps.length > 1 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>DESPUÉS</Text>
                {pendingSteps.slice(1).map((step) => (
                  <StepRow key={step.id} step={step} onSpeak={() => speakStep(step)} />
                ))}
              </View>
            ) : null}

            {doneSteps.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TERMINADO</Text>
                {doneSteps.map((step) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    onSpeak={() => speakStep(step)}
                    onToggle={() => toggleStep(selectedRoutine, step)}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          <BigButton
            label="Reiniciar rutina"
            variant="secondary"
            emoji="🔄"
            onPress={() => resetRoutine(selectedRoutine.id)}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable topInset={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Día</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : routines.length === 0 ? (
        <Text style={styles.empty}>Todavía no hay rutinas. Un adulto puede crearlas en Modo Adulto.</Text>
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
    </ScreenContainer>
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
  empty: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 1,
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
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
