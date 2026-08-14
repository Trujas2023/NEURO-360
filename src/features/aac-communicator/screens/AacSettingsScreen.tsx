import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak, speakOptionsForPreferences } from '@services/audio/speech';
import { BigButton, ScreenContainer } from '@shared/components';
import { COMMUNICATION_LEVELS, DEFAULT_COMMUNICATION_LEVEL, DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { colors, radius, spacing, typography } from '@shared/theme';
import type { AacBoardSize, AacTextSize, ChildProfilePreferences, CommunicationLevel } from '@shared/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AacSettings'>;

const BOARD_SIZES: AacBoardSize[] = ['2x2', '2x3', '3x3', '3x4', '4x4'];
const TEXT_SIZES: { value: AacTextSize; label: string }[] = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
];
const VOICE_RATES: { value: number; label: string }[] = [
  { value: 0.75, label: 'Lenta' },
  { value: 1, label: 'Normal' },
  { value: 1.25, label: 'Rápida' },
];
const VOICE_PITCHES: { value: number; label: string }[] = [
  { value: 0.8, label: 'Grave' },
  { value: 1, label: 'Normal' },
  { value: 1.2, label: 'Agudo' },
];

/**
 * Personalización AAC de un perfil (Modo Adulto): tamaño de tablero,
 * tamaño de texto y qué mostrar en el comunicador. Solo accesible tras el
 * PIN de `PinGateScreen`.
 */
export function AacSettingsScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles, updateProfile } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);

  if (!profile) {
    return (
      <ScreenContainer centered>
        <Text style={styles.empty}>No se encontró el perfil.</Text>
        <BigButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const prefs: ChildProfilePreferences = { ...DEFAULT_PROFILE_PREFERENCES, ...profile.preferences };
  const level = profile.communicationLevel ?? DEFAULT_COMMUNICATION_LEVEL;

  function setPref<K extends keyof ChildProfilePreferences>(key: K, value: ChildProfilePreferences[K]) {
    updateProfile(profileId, { preferences: { ...prefs, [key]: value } });
  }

  function setLevel(value: CommunicationLevel) {
    updateProfile(profileId, { communicationLevel: value });
  }

  function tryVoice() {
    speak('Hola, así suena mi voz.', speakOptionsForPreferences(prefs));
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>Ajustes de Mi Voz</Text>
      <Text style={styles.subtitle}>Personalización AAC de {profile.name}</Text>

      <Section title="Nivel de comunicación">
        <View style={styles.chipRow}>
          {COMMUNICATION_LEVELS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={level === option.value}
              onPress={() => setLevel(option.value)}
            />
          ))}
        </View>
        <Text style={styles.toggleHint}>
          {COMMUNICATION_LEVELS.find((option) => option.value === level)?.description}
        </Text>
      </Section>

      <Section title="Voz">
        <Text style={styles.subsectionLabel}>Velocidad</Text>
        <View style={styles.chipRow}>
          {VOICE_RATES.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={(prefs.ttsRate ?? 1) === option.value}
              onPress={() => setPref('ttsRate', option.value)}
            />
          ))}
        </View>
        <Text style={styles.subsectionLabel}>Tono</Text>
        <View style={styles.chipRow}>
          {VOICE_PITCHES.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={(prefs.ttsPitch ?? 1) === option.value}
              onPress={() => setPref('ttsPitch', option.value)}
            />
          ))}
        </View>
        <View style={styles.tryVoiceButton}>
          <BigButton label="Probar voz" emoji="🔊" variant="secondary" fullWidth={false} onPress={tryVoice} />
        </View>
      </Section>

      <Section title="Tamaño del tablero">
        <View style={styles.chipRow}>
          {BOARD_SIZES.map((size) => (
            <Chip key={size} label={size} selected={prefs.boardSize === size} onPress={() => setPref('boardSize', size)} />
          ))}
        </View>
      </Section>

      <Section title="Tamaño del texto">
        <View style={styles.chipRow}>
          {TEXT_SIZES.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={prefs.textSize === option.value}
              onPress={() => setPref('textSize', option.value)}
            />
          ))}
        </View>
      </Section>

      <Section title="Comunicación">
        <ToggleRow
          label="Hablar al tocar"
          hint="Si está apagado, la tarjeta solo se agrega a la frase; se habla al pulsar Hablar."
          value={prefs.speakOnTap ?? true}
          onValueChange={(value) => setPref('speakOnTap', value)}
        />
        <ToggleRow
          label="Confirmar antes de borrar"
          value={prefs.confirmBeforeDelete ?? true}
          onValueChange={(value) => setPref('confirmBeforeDelete', value)}
        />
      </Section>

      <Section title="Qué mostrar en el comunicador">
        <ToggleRow label="Texto en las tarjetas" value={prefs.showCardText ?? true} onValueChange={(value) => setPref('showCardText', value)} />
        <ToggleRow label="Imagen o pictograma" value={prefs.showCardImage ?? true} onValueChange={(value) => setPref('showCardImage', value)} />
        <ToggleRow label="Colores de categoría" value={prefs.showCardColor ?? true} onValueChange={(value) => setPref('showCardColor', value)} />
        <ToggleRow label="Favoritos" value={prefs.showFavorites ?? true} onValueChange={(value) => setPref('showFavorites', value)} />
        <ToggleRow label="Más usados" value={prefs.showMostUsed ?? true} onValueChange={(value) => setPref('showMostUsed', value)} />
        <ToggleRow label="Barra de frase" value={prefs.showPhraseBar ?? true} onValueChange={(value) => setPref('showPhraseBar', value)} />
        <ToggleRow label="Categorías" value={prefs.showCategories ?? true} onValueChange={(value) => setPref('showCategories', value)} />
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

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint ? <Text style={styles.toggleHint}>{hint}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} accessibilityLabel={label} />
    </View>
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
  empty: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  subsectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tryVoiceButton: {
    marginTop: spacing.sm,
    alignItems: 'flex-start',
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
  toggleHint: {
    marginTop: 2,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
