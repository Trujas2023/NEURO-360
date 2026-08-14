import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { useGameSettings } from '../hooks/useGameSettings';
import { ROUNDS_BY_LENGTH } from '../types';
import type { GameDifficulty, GameSessionLength } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GamesSettings'>;

const DIFFICULTIES: { value: GameDifficulty; label: string; hint: string }[] = [
  { value: 'easy', label: 'Fácil', hint: '2 opciones' },
  { value: 'medium', label: 'Media', hint: '3 opciones' },
  { value: 'hard', label: 'Difícil', hint: '4 opciones' },
];

const LENGTHS: { value: GameSessionLength; label: string }[] = [
  { value: 'short', label: 'Corta' },
  { value: 'medium', label: 'Media' },
  { value: 'long', label: 'Larga' },
];

/** Modo Adulto: ajustes de Juega & Regula de un perfil. Solo accesible tras el PIN. */
export function GamesSettingsScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);
  const { settings, updateSettings } = useGameSettings(profileId);

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Ajustes de juegos</Text>
      <Text style={styles.subtitle}>Juega & Regula de {profile?.name ?? 'este perfil'}</Text>

      <Section title="Dificultad">
        <Text style={styles.hint}>Cuántas opciones se ofrecen en cada ronda.</Text>
        <View style={styles.chipRow}>
          {DIFFICULTIES.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={settings.difficulty === option.value}
              onPress={() => updateSettings({ difficulty: option.value })}
            />
          ))}
        </View>
        <Text style={styles.hint}>{DIFFICULTIES.find((item) => item.value === settings.difficulty)?.hint}</Text>
      </Section>

      <Section title="Duración de la partida">
        <Text style={styles.hint}>
          Se mide en rondas, no en tiempo: no hay cuenta regresiva ni presión por terminar rápido.
        </Text>
        <View style={styles.chipRow}>
          {LENGTHS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={settings.sessionLength === option.value}
              onPress={() => updateSettings({ sessionLength: option.value })}
            />
          ))}
        </View>
        <Text style={styles.hint}>{ROUNDS_BY_LENGTH[settings.sessionLength]} rondas.</Text>
      </Section>

      <Section title="Apoyos">
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleLabel}>Voz de apoyo</Text>
            <Text style={styles.hint}>Lee la consigna y celebra los aciertos.</Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => updateSettings({ soundEnabled: value })}
            accessibilityLabel="Voz de apoyo"
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleLabel}>Vibración suave</Text>
            <Text style={styles.hint}>Solo al acertar; equivocarse nunca vibra.</Text>
          </View>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
            accessibilityLabel="Vibración suave"
          />
        </View>
      </Section>

      <View style={styles.actions}>
        <BigButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  toggleLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
