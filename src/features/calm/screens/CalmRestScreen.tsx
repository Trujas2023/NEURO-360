import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import type { AudioSource } from 'expo-audio';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { VisualTimer } from '@features/daily-routine/components/VisualTimer';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, touchTargets, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CalmRest'>;

const DURATIONS_MIN = [1, 2, 5];

type SoundId = 'silence' | 'pad' | 'breeze';

const SOUND_OPTIONS: { id: SoundId; label: string; source: AudioSource | null }[] = [
  { id: 'silence', label: 'Silencio', source: null },
  { id: 'pad', label: 'Sonido suave', source: require('@assets/sounds/calm_pad.wav') },
  { id: 'breeze', label: 'Brisa', source: require('@assets/sounds/calm_breeze.wav') },
];

/**
 * "Necesito un descanso" (Fase 7G): acción directa de un toque desde
 * `CalmCommunicationScreen`, sin árbol de decisión — acá adentro sí se
 * elige cuánto tiempo y si se quiere un sonido de fondo, pero nada de eso
 * es obligatorio para empezar.
 *
 * El temporizador reutiliza `VisualTimer` de `daily-routine` tal cual,
 * sin forkearlo: ya es genérico (duración + reduceMotion, sin depender de
 * rutinas), así que no hacía falta reconstruirlo.
 *
 * "Sonido suave"/"Brisa" son tonos propios (ver `docs/
 * V7_SENSORY_WORLD_COMPLETION.md` para el mismo criterio aplicado en Mundo
 * Sensorial): ondas sintetizadas por código, no grabaciones de terceros —
 * no hay ninguna licencia que verificar. Se ocultan por completo si el
 * perfil tiene el sonido apagado (`soundEnabled`), igual que el resto de
 * la app.
 */
export function CalmRestScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const soundEnabled = activeProfile?.preferences.soundEnabled ?? true;
  const reduceMotion = activeProfile?.preferences.reduceMotion ?? false;

  const [durationMinutes, setDurationMinutes] = useState(2);
  const [soundId, setSoundId] = useState<SoundId>('silence');

  const player = useAudioPlayer(null);
  const soundOption = SOUND_OPTIONS.find((option) => option.id === soundId);

  /* eslint-disable react-hooks/immutability -- `player.loop` es una
     propiedad mutable del módulo nativo de expo-audio: no hay método
     equivalente ni opción del hook para fijarla al crear el reproductor.
     No es estado de React, así que mutarla acá es seguro pese a la regla. */
  useEffect(() => {
    if (!soundOption?.source) {
      try {
        player.pause();
      } catch {
        // no había nada sonando; no es un error real.
      }
      return;
    }
    try {
      player.loop = true;
      player.replace(soundOption.source);
      player.play();
    } catch {
      // Asset ausente o formato no soportado: sigue funcionando sin sonido.
    }
    // Solo depende de soundId a propósito: `player` es una instancia
    // estable durante toda la vida del componente (la gestiona el hook).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundId]);
  /* eslint-enable react-hooks/immutability */

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>😴 Necesito un descanso</Text>
      </View>

      <Text style={styles.sectionLabel}>¿Cuánto tiempo?</Text>
      <View style={styles.chipRow}>
        {DURATIONS_MIN.map((minutes) => (
          <Pressable
            key={minutes}
            onPress={() => setDurationMinutes(minutes)}
            accessibilityRole="button"
            accessibilityLabel={`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`}
            accessibilityState={{ selected: durationMinutes === minutes }}
            style={[styles.chip, durationMinutes === minutes && styles.chipSelected]}
          >
            <Text style={[styles.chipText, durationMinutes === minutes && styles.chipTextSelected]}>
              {minutes} {minutes === 1 ? 'min' : 'min'}
            </Text>
          </Pressable>
        ))}
      </View>

      {soundEnabled ? (
        <>
          <Text style={styles.sectionLabel}>¿Con sonido de fondo?</Text>
          <View style={styles.chipRow}>
            {SOUND_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setSoundId(option.id)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: soundId === option.id }}
                style={[styles.chip, soundId === option.id && styles.chipSelected]}
              >
                <Text style={[styles.chipText, soundId === option.id && styles.chipTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionLabel}>Cuando estés listo, toca Empezar</Text>
      <VisualTimer key={durationMinutes} durationSeconds={durationMinutes * 60} reduceMotion={reduceMotion} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
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
    color: colors.textPrimary,
  },
});
