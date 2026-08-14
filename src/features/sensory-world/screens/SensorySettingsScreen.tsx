import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { SENSORY_PALETTE } from '../data/activities';
import { useSensorySettings } from '../hooks/useSensorySettings';
import type { BreathingPattern, SensoryIntensity, TrackingSpeed } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensorySettings'>;

const INTENSITIES: { value: SensoryIntensity; label: string }[] = [
  { value: 'low', label: 'Pocas' },
  { value: 'medium', label: 'Medias' },
  { value: 'high', label: 'Muchas' },
];

const PATTERNS: { value: BreathingPattern; label: string }[] = [
  { value: '3-3-4', label: '3 · 3 · 4' },
  { value: '4-4-4', label: '4 · 4 · 4' },
  { value: '4-2-6', label: '4 · 2 · 6' },
];

const SPEEDS: { value: TrackingSpeed; label: string }[] = [
  { value: 'verySlow', label: 'Muy lenta' },
  { value: 'slow', label: 'Lenta' },
  { value: 'medium', label: 'Media' },
];

/** Modo Adulto: ajustes de Mundo Sensorial de un perfil. Solo accesible tras el PIN. */
export function SensorySettingsScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);
  const { settings, updateSettings } = useSensorySettings(profileId);

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Ajustes sensoriales</Text>
      <Text style={styles.subtitle}>Mundo Sensorial de {profile?.name ?? 'este perfil'}</Text>

      <Section title="Burbujas">
        <Text style={styles.hint}>Cuántas burbujas aparecen a la vez.</Text>
        <View style={styles.chipRow}>
          {INTENSITIES.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={settings.bubbleIntensity === option.value}
              onPress={() => updateSettings({ bubbleIntensity: option.value })}
            />
          ))}
        </View>
      </Section>

      <Section title="Respiración">
        <Text style={styles.hint}>Segundos de inhalar · mantener · exhalar.</Text>
        <View style={styles.chipRow}>
          {PATTERNS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={settings.breathingPattern === option.value}
              onPress={() => updateSettings({ breathingPattern: option.value })}
            />
          ))}
        </View>
      </Section>

      <Section title="Seguimiento visual">
        <Text style={styles.hint}>Velocidad del objeto.</Text>
        <View style={styles.chipRow}>
          {SPEEDS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={settings.trackingSpeed === option.value}
              onPress={() => updateSettings({ trackingSpeed: option.value })}
            />
          ))}
        </View>
        <Text style={styles.hint}>Color del objeto.</Text>
        <View style={styles.chipRow}>
          {SENSORY_PALETTE.map((swatch) => (
            <Pressable
              key={swatch}
              onPress={() => updateSettings({ trackingColor: swatch })}
              accessibilityRole="button"
              accessibilityLabel={`Elegir color ${swatch}`}
              accessibilityState={{ selected: settings.trackingColor === swatch }}
              style={[
                styles.swatch,
                { backgroundColor: swatch },
                settings.trackingColor === swatch && styles.swatchSelected,
              ]}
            />
          ))}
        </View>
      </Section>

      <Section title="Táctil">
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextWrap}>
            <Text style={styles.toggleLabel}>Vibración suave</Text>
            <Text style={styles.hint}>Se ignora si el dispositivo no la admite.</Text>
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
  swatch: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.textPrimary,
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
