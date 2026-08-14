import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak, speakOptionsForPreferences } from '@services/audio/speech';
import { colors, radius, spacing, typography } from '@shared/theme';

import type { QuickPhrase } from '../data/emergencyVocabulary';

export interface QuickCommunicationProps {
  phrases: QuickPhrase[];
}

/**
 * Grilla de frases de comunicación rápida (Calma 360, Ayuda). Cada frase
 * se reproduce de inmediato al tocarla, sin pasar por la barra de frase:
 * son de uso inmediato, no una oración a construir.
 */
export function QuickCommunication({ phrases }: QuickCommunicationProps) {
  const { activeProfile } = useProfiles();
  const soundEnabled = activeProfile?.preferences.soundEnabled ?? true;
  const ttsOptions = speakOptionsForPreferences(activeProfile?.preferences);

  return (
    <View style={styles.grid}>
      {phrases.map((phrase) => (
        <Pressable
          key={phrase.id}
          onPress={() => {
            if (soundEnabled) {
              speak(phrase.label, ttsOptions);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={phrase.label}
          accessibilityHint="Toca para escuchar esta frase de inmediato"
          style={({ pressed }) => [styles.card, { borderColor: phrase.color, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={styles.emoji}>{phrase.emoji}</Text>
          <Text style={styles.label} numberOfLines={2}>
            {phrase.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  card: {
    width: 140,
    minHeight: 100,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  emoji: {
    fontSize: 32,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
