import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { speak, speakOptionsForPreferences } from '@services/audio/speech';
import { colors, radius, spacing, typography } from '@shared/theme';

import type { QuickPhrase } from '../types';

export interface QuickCommunicationProps {
  phrases: QuickPhrase[];
  /**
   * Se llama al pulsar "Más" en una frase que tenga `detail`. Si se omite,
   * no se muestra ese botón y todas las tarjetas se comportan igual
   * (hablar y nada más).
   */
  onDetail?: (phrase: QuickPhrase) => void;
}

/**
 * Grilla de frases de comunicación rápida (Calma 360, Ayuda). Cada frase
 * se reproduce de inmediato al tocarla, sin pasar por la barra de frase:
 * son de uso inmediato, no una oración a construir.
 *
 * Algunas frases pueden ofrecer además un flujo guiado opcional ("Más"),
 * que vive en un control aparte para no interferir con el toque
 * principal: en una crisis, tocar la tarjeta siempre habla, nunca abre
 * una pantalla nueva por sorpresa.
 */
export function QuickCommunication({ phrases, onDetail }: QuickCommunicationProps) {
  const { activeProfile } = useProfiles();
  const soundEnabled = activeProfile?.preferences.soundEnabled ?? true;
  const ttsOptions = speakOptionsForPreferences(activeProfile?.preferences);

  return (
    <View style={styles.grid}>
      {phrases.map((phrase) => {
        const showDetail = !!phrase.detail && !!onDetail;

        return (
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
            {showDetail ? (
              <Pressable
                onPress={() => onDetail?.(phrase)}
                accessibilityRole="button"
                accessibilityLabel={`Contar más sobre "${phrase.label}"`}
                accessibilityHint="Abre preguntas para explicar mejor"
                style={({ pressed }) => [styles.detailButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={styles.detailButtonText}>Contar más ›</Text>
              </Pressable>
            ) : null}
          </Pressable>
        );
      })}
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
    minHeight: 110,
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
  detailButton: {
    marginTop: spacing.xs,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
});
