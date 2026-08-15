import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { AacCardVisual } from '@features/aac-communicator/components/AacCardVisual';
import { BigButton, ScreenContainer } from '@shared/components';
import { AVATAR_COLORS as PALETTE_COLORS } from '@shared/constants/profiles';
import { colors, radius, spacing, touchTargets, typography } from '@shared/theme';

import { useRoutines } from '../hooks/useRoutines';
import type { RoutineDisplayMode, RoutineStep } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineForm'>;

const DISPLAY_MODES: { value: RoutineDisplayMode; label: string; description: string }[] = [
  { value: 'list', label: 'Lista', description: 'Todos los pasos a la vez.' },
  { value: 'firstThen', label: 'Primero / Después', description: 'Solo dos pasos a la vez.' },
  { value: 'nowNextDone', label: 'Ahora / Después / Terminado', description: 'Separa lo hecho de lo que falta.' },
];

/**
 * Duraciones disponibles para el temporizador visual de un paso. `0`
 * significa "sin tiempo": el botón las recorre en orden, para no meter un
 * selector numérico en una pantalla que ya tiene bastante.
 */
const DURATION_PRESETS = [0, 30, 60, 120, 300, 600];

function formatDuration(seconds?: number): string {
  if (!seconds) {
    return 'Sin tiempo';
  }
  return seconds < 60 ? `${seconds} s` : `${seconds / 60} min`;
}

/** Modo Adulto: crear o editar una rutina de Mi Día, sus pasos y cómo se le presenta al niño. */
export function RoutineFormScreen({ route, navigation }: Props) {
  const { profileId, routineId } = route.params;
  const { routines, createRoutine, updateRoutine, addStep, updateStep, deleteStep, moveStep } =
    useRoutines(profileId);
  const editingRoutine = useMemo(() => routines.find((routine) => routine.id === routineId) ?? null, [routines, routineId]);

  const [title, setTitle] = useState(editingRoutine?.title ?? '');
  const [emoji, setEmoji] = useState(editingRoutine?.emoji ?? '🗓️');
  const [color, setColor] = useState(editingRoutine?.color ?? PALETTE_COLORS[0]);
  const [displayMode, setDisplayMode] = useState<RoutineDisplayMode>(editingRoutine?.displayMode ?? 'list');
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

    const details = { title: trimmedTitle, emoji: emoji.trim() || '🗓️', color, displayMode };

    setSaving(true);
    try {
      if (savedRoutineId) {
        await updateRoutine(savedRoutineId, details);
      } else {
        const routine = await createRoutine(details);
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

  async function pickStepPhoto(step: RoutineStep) {
    if (!savedRoutineId) {
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Activa el acceso a la galería para elegir una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      await updateStep(savedRoutineId, step.id, { imageUri: result.assets[0].uri });
    }
  }

  function cycleStepDuration(step: RoutineStep) {
    if (!savedRoutineId) {
      return;
    }
    const currentIndex = DURATION_PRESETS.indexOf(step.durationSeconds ?? 0);
    const next = DURATION_PRESETS[(currentIndex + 1) % DURATION_PRESETS.length];
    updateStep(savedRoutineId, step.id, { durationSeconds: next === 0 ? undefined : next });
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

      <Text style={styles.label}>Cómo se ve la rutina</Text>
      <View style={styles.modeRow}>
        {DISPLAY_MODES.map((mode) => (
          <Pressable
            key={mode.value}
            onPress={() => setDisplayMode(mode.value)}
            accessibilityRole="button"
            accessibilityLabel={mode.label}
            accessibilityState={{ selected: displayMode === mode.value }}
            style={[styles.modeChip, displayMode === mode.value && styles.modeChipSelected]}
          >
            <Text style={[styles.modeChipText, displayMode === mode.value && styles.modeChipTextSelected]}>
              {mode.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.modeHint}>{DISPLAY_MODES.find((mode) => mode.value === displayMode)?.description}</Text>

      <BigButton
        label={savedRoutineId ? 'Guardar cambios' : 'Guardar rutina'}
        emoji="✅"
        onPress={handleSaveDetails}
        loading={saving}
      />

      {savedRoutineId ? (
        <View style={styles.stepsSection}>
          <Text style={styles.stepsTitle}>Pasos</Text>

          {steps.length === 0 ? (
            <Text style={styles.empty}>Todavía no hay pasos.</Text>
          ) : (
            steps.map((step, index) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepHeader}>
                  <AacCardVisual emoji={step.emoji} imageUri={step.imageUri} size={36} />
                  <Text style={styles.stepLabel} numberOfLines={2}>
                    {step.label}
                  </Text>
                </View>

                <View style={styles.stepActions}>
                  <Pressable
                    onPress={() => cycleStepDuration(step)}
                    accessibilityRole="button"
                    accessibilityLabel={`Tiempo del paso "${step.label}": ${formatDuration(step.durationSeconds)}. Toca para cambiar.`}
                    style={({ pressed }) => [styles.durationChip, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={styles.durationChipText}>⏱ {formatDuration(step.durationSeconds)}</Text>
                  </Pressable>

                  <IconButton label="Elegir foto del paso" icon="📷" onPress={() => pickStepPhoto(step)} />
                  {step.imageUri ? (
                    <IconButton
                      label="Quitar foto del paso"
                      icon="🚫"
                      onPress={() => updateStep(savedRoutineId, step.id, { imageUri: undefined })}
                    />
                  ) : null}
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
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.textPrimary,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modeChip: {
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  modeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  modeChipTextSelected: {
    color: colors.textPrimary,
  },
  modeHint: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  stepActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  durationChip: {
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  iconButton: {
    width: touchTargets.minimum,
    height: touchTargets.minimum,
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
