import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, EmptyState, ScreenContainer, useConfirmDialog } from '@shared/components';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { useReduceMotion } from '@shared/hooks';
import { colors, radius, spacing, typography } from '@shared/theme';

import { useRoutines } from '../hooks/useRoutines';
import type { DailyRoutine } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineManager'>;

/** Modo Adulto: alta, edición y eliminación de rutinas de Mi Día de un perfil. */
export function RoutineManagerScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);
  const confirmBeforeDelete =
    profile?.preferences.confirmBeforeDelete ?? DEFAULT_PROFILE_PREFERENCES.confirmBeforeDelete;
  const { routines, loading, reload, deleteRoutine } = useRoutines(profileId);
  const reduceMotion = useReduceMotion();
  const { confirm, dialog } = useConfirmDialog(reduceMotion);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  async function handleDelete(routine: DailyRoutine) {
    if (!confirmBeforeDelete) {
      deleteRoutine(routine.id);
      return;
    }
    const ok = await confirm({
      title: 'Eliminar rutina',
      message: `¿Eliminar "${routine.title}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      destructive: true,
    });
    if (ok) {
      deleteRoutine(routine.id);
    }
  }

  return (
    <ScreenContainer scrollable loading={loading} loadingLabel="Cargando rutinas…">
      <Text style={styles.title}>Mi Día</Text>
      <Text style={styles.subtitle}>Rutinas del perfil</Text>

      {routines.length === 0 ? (
        <EmptyState emoji="🗓️" title="Todavía no hay rutinas para este perfil." />
      ) : (
        routines
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((routine) => (
            <View key={routine.id} style={styles.row}>
              <Text style={styles.rowEmoji}>{routine.emoji}</Text>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {routine.title}
                </Text>
                <Text style={styles.rowSubtitle}>{routine.steps.length} pasos</Text>
              </View>
              <View style={styles.rowActions}>
                <View style={styles.smallButton}>
                  <BigButton
                    label="Editar"
                    variant="secondary"
                    fullWidth={false}
                    onPress={() =>
                      navigation.navigate('RoutineForm', { profileId, routineId: routine.id })
                    }
                  />
                </View>
                <View style={styles.smallButton}>
                  <BigButton
                    label="Eliminar"
                    variant="danger"
                    fullWidth={false}
                    onPress={() => handleDelete(routine)}
                  />
                </View>
              </View>
            </View>
          ))
      )}

      <View style={styles.actions}>
        <BigButton
          label="Crear rutina"
          emoji="➕"
          onPress={() => navigation.navigate('RoutineForm', { profileId })}
        />
        <View style={styles.spacer} />
        <BigButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </View>

      {dialog}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  rowEmoji: {
    fontSize: typography.sizes.xl,
    marginRight: spacing.sm,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    width: '100%',
    justifyContent: 'flex-end',
  },
  smallButton: {
    marginLeft: spacing.xs,
  },
  actions: {
    marginTop: spacing.lg,
  },
  spacer: {
    height: spacing.sm,
  },
});
