import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ScreenContainer } from '@shared/components';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { colors, radius, spacing, typography } from '@shared/theme';

import { useRoutines } from '../hooks/useRoutines';
import type { DailyRoutine } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineManager'>;

/** Modo Adulto: alta, edición y eliminación de rutinas de Mi Día de un perfil. */
export function RoutineManagerScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);
  const confirmBeforeDelete = profile?.preferences.confirmBeforeDelete ?? DEFAULT_PROFILE_PREFERENCES.confirmBeforeDelete;
  const { routines, loading, reload, deleteRoutine, duplicateRoutine, moveRoutine } = useRoutines(profileId);
  const sortedRoutines = [...routines].sort((a, b) => a.order - b.order);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  function handleDelete(routine: DailyRoutine) {
    if (!confirmBeforeDelete) {
      deleteRoutine(routine.id);
      return;
    }
    Alert.alert('Eliminar rutina', `¿Eliminar "${routine.title}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteRoutine(routine.id) },
    ]);
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Mi Día</Text>
      <Text style={styles.subtitle}>Rutinas del perfil</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : routines.length === 0 ? (
        <Text style={styles.empty}>Todavía no hay rutinas para este perfil.</Text>
      ) : (
        sortedRoutines.map((routine, index) => (
          <View key={routine.id} style={styles.row}>
            <Text style={styles.rowEmoji}>{routine.emoji}</Text>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {routine.title}
              </Text>
              <Text style={styles.rowSubtitle}>{routine.steps.length} pasos</Text>
            </View>
            <View style={styles.rowActions}>
              <IconButton
                label={`Mover "${routine.title}" arriba`}
                icon="↑"
                onPress={() => moveRoutine(routine.id, 'up')}
                disabled={index === 0}
              />
              <IconButton
                label={`Mover "${routine.title}" abajo`}
                icon="↓"
                onPress={() => moveRoutine(routine.id, 'down')}
                disabled={index === sortedRoutines.length - 1}
              />
              <View style={styles.smallButton}>
                <BigButton
                  label="Duplicar"
                  variant="secondary"
                  fullWidth={false}
                  onPress={() => duplicateRoutine(routine.id)}
                />
              </View>
              <View style={styles.smallButton}>
                <BigButton
                  label="Editar"
                  variant="secondary"
                  fullWidth={false}
                  onPress={() => navigation.navigate('RoutineForm', { profileId, routineId: routine.id })}
                />
              </View>
              <View style={styles.smallButton}>
                <BigButton label="Eliminar" variant="danger" fullWidth={false} onPress={() => handleDelete(routine)} />
              </View>
            </View>
          </View>
        ))
      )}

      <View style={styles.actions}>
        <BigButton label="Crear rutina" emoji="➕" onPress={() => navigation.navigate('RoutineForm', { profileId })} />
        <View style={styles.spacer} />
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
  empty: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
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
