import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, OptionRow, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { useSensoryPreferences } from '../hooks/useSensoryPreferences';
import type { AnimationSpeed, VisualLevel } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensorySettings'>;

const SPEED_OPTIONS: { value: AnimationSpeed; label: string }[] = [
  { value: 'slow', label: 'Lenta' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Rápida' },
];

const VISUAL_LEVEL_OPTIONS: { value: VisualLevel; label: string }[] = [
  { value: 'low', label: 'Bajo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
];

const SESSION_DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Sin límite' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
];

/**
 * Modo Adulto (alcanzable solo vía PIN, ver `PinGateScreen`): ajustes
 * sensoriales por perfil. "Sonido general" reutiliza
 * `ChildProfilePreferences.soundEnabled` (Fase 2), ya compartido con el
 * comunicador AAC; el resto son ajustes propios de Mundo Sensorial.
 */
export function SensorySettingsScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles, updateProfile } = useProfiles();
  const { preferences, loading, update } = useSensoryPreferences(profileId);
  const profile = profiles.find((candidate) => candidate.id === profileId);

  if (loading || !profile) {
    return (
      <ScreenContainer centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  function setSoundEnabled(value: boolean) {
    if (!profile) {
      return;
    }
    updateProfile(profile.id, { preferences: { ...profile.preferences, soundEnabled: value } });
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>⚙️ Ajustes sensoriales</Text>
      <Text style={styles.subtitle}>{profile.name}</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Sonido general</Text>
        <Switch value={profile.preferences.soundEnabled} onValueChange={setSoundEnabled} accessibilityLabel="Sonido general" />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Vibración</Text>
        <Switch
          value={preferences.vibrationEnabled}
          onValueChange={(value) => update({ vibrationEnabled: value })}
          accessibilityLabel="Vibración"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Modo reducido de estímulos</Text>
        <Switch
          value={preferences.reducedStimulation}
          onValueChange={(value) => update({ reducedStimulation: value })}
          accessibilityLabel="Modo reducido de estímulos"
        />
      </View>

      <Text style={styles.label}>Velocidad de animaciones</Text>
      <OptionRow
        options={SPEED_OPTIONS}
        value={preferences.animationSpeed}
        onChange={(value) => update({ animationSpeed: value })}
      />

      <Text style={styles.label}>Nivel visual</Text>
      <OptionRow
        options={VISUAL_LEVEL_OPTIONS}
        value={preferences.visualLevel}
        onChange={(value) => update({ visualLevel: value })}
      />

      <Text style={styles.label}>Duración de sesión</Text>
      <OptionRow
        options={SESSION_DURATION_OPTIONS}
        value={preferences.sessionDurationMinutes ?? 0}
        onChange={(value) => update({ sessionDurationMinutes: value === 0 ? null : value })}
      />

      <View style={styles.actions}>
        <BigButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
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
    marginBottom: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  rowLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
