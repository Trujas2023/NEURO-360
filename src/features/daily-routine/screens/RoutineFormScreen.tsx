import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ScreenContainer } from '@shared/components';
import { AVATAR_COLORS as PALETTE_COLORS } from '@shared/constants/profiles';
import { colors, radius, spacing, typography } from '@shared/theme';

import { useRoutines } from '../hooks/useRoutines';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineForm'>;

/**
 * Modo Adulto: crear o editar una rutina de Mi Día y sus pasos. Los pasos
 * usan texto + emoji (sin foto/audio todavía, ver docs/AAC_PRO_FASE2_PLAN.md).
 */
export function RoutineFormScreen({ route, navigation }: Props) {
  const { profileId, routineId } = route.params;
  const { routines, createRoutine, updateRoutine, addStep, deleteStep, moveStep } = useRoutines(profileId);
  const editingRoutine = useMemo(() => routines.find((routine) => routine.id === routineId) ?? null, [routines, routineId]);

  const [title, setTitle] = useState(editingRoutine?.title ?? '');
  const [emoji, setEmoji] = useState(editingRoutine?.emoji ?? '🗓️');
  const [color, setColor] = useState(editingRoutine?.color ?? PALETTE_COLORS[0]);
  const [stepLabel, setStepLabel] = useState('');
  const [stepEmoji, setStepEmoji] = useState('⭐');
  const [saving, setSaving] = useState(false);
  const [savedRoutineId, setSavedRoutineId] = useState(editingRoutine?.id ?? null);

  const currentRoutine = routines.find((routine) => routine.id === savedRoutineId) ?? null;
  const steps = currentRoutine ? [...currentRoutine.steps].sort((a, b) => a.order - b.order) : [];

  async function handleSaveDetails() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Falta el nombre', 'Escribe el nombre de la rutina antes de guardar.');
      return;
    }

    setSaving(true);
    try {
      if (savedRoutineId) {
        await updateRoutine(savedRoutineId, { title: trimmedTitle, emoji: emoji.trim() || '🗓️', color });
      } else {
        const routine = await createRoutine({ title: trimmedTitle, emoji: emoji.trim() || '🗓️', color });
        setSavedRoutineId(routine.id);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAddStep() {
    if (!savedRoutineId) {
      Alert.alert('Guarda la rutina primero', 'Guarda el nombre de la rutina antes de agregar pasos.');
      return;
    }
    const trimmedLabel = stepLabel.trim();
    if (!trimmedLabel) {
      return;
    }
    await addStep(savedRoutineId, { label: trimmedLabel, emoji: stepEmoji.trim() || '⭐' });
    setStepLabel('');
    setStepEmoji('⭐');
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>{editingRoutine ? 'Editar rutina' : 'Nueva rutina'}</Text>

      <Text style={styles.label}>Nombre de la rutina</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ej: Prepararme para la escuela"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        accessibilityLabel="Nombre de la rutina"
      />

      <Text style={styles.label}>Emoji</Text>
      <TextInput
        value={emoji}
        onChangeText={setEmoji}
        placeholder="🗓️"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        accessibilityLabel="Emoji de la rutina"
      />

      <Text style={styles.label}>Color</Text>
      <View style={styles.swatchRow}>
        {PALETTE_COLORS.map((swatch) => (
          <Pressable
            key={swatch}
            onPress={() => setColor(swatch)}
            accessibilityRole="button"
            accessibilityLabel={`Elegir color ${swatch}`}
            style={[styles.swatch, { backgroundColor: swatch }, swatch === color && styles.swatchSelected]}
          />
        ))}
      </View>

      <BigButton
        label={savedRoutineId ? 'Guardar cambios' : 'Guardar rutina'}
        emoji="✅"
        onPress={handleSaveDetails}
        disabled={saving}
      />

      {savedRoutineId ? (
        <View style={styles.stepsSection}>
          <Text style={styles.stepsTitle}>Pasos</Text>

          {steps.length === 0 ? (
            <Text style={styles.empty}>Todavía no hay pasos.</Text>
          ) : (
            steps.map((step, index) => (
              <View key={step.id} style={styles.stepRow}>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
                <Text style={styles.stepLabel} numberOfLines={1}>
                  {step.label}
                </Text>
                <View style={styles.stepActions}>
                  <IconButton label="Mover arriba" icon="↑" onPress={() => moveStep(savedRoutineId, step.id, 'up')} disabled={index === 0} />
                  <IconButton
                    label="Mover abajo"
                    icon="↓"
                    onPress={() => moveStep(savedRoutineId, step.id, 'down')}
                    disabled={index === steps.length - 1}
                  />
                  <IconButton
                    label="Eliminar paso"
                    icon="🗑️"
                    onPress={() =>
                      Alert.alert('Eliminar paso', `¿Eliminar "${step.label}"?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Eliminar', style: 'destructive', onPress: () => deleteStep(savedRoutineId, step.id) },
                      ])
                    }
                  />
                </View>
              </View>
            ))
          )}

          <View style={styles.addStepRow}>
            <TextInput
              value={stepEmoji}
              onChangeText={setStepEmoji}
              placeholder="⭐"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.stepEmojiInput]}
              accessibilityLabel="Emoji del nuevo paso"
            />
            <TextInput
              value={stepLabel}
              onChangeText={setStepLabel}
              placeholder="Nuevo paso, ej: Vestirme"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.stepLabelInput]}
              accessibilityLabel="Texto del nuevo paso"
              onSubmitEditing={handleAddStep}
            />
          </View>
          <BigButton label="Agregar paso" variant="secondary" emoji="➕" onPress={handleAddStep} />
        </View>
      ) : null}

      <View style={styles.actions}>
        <BigButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
}

function IconButton({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, { opacity: disabled ? 0.3 : pressed ? 0.7 : 1 }]}
    >
      <Text style={styles.iconButtonText}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  input: {
    minHeight: spacing.xxl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  stepsSection: {
    marginTop: spacing.xl,
  },
  stepsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  empty: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  stepEmoji: {
    fontSize: typography.sizes.lg,
  },
  stepLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  stepActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButtonText: {
    fontSize: typography.sizes.md,
  },
  addStepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepEmojiInput: {
    width: 64,
    textAlign: 'center',
  },
  stepLabelInput: {
    flex: 1,
  },
  actions: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
});
