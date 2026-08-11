import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BigButton, OptionRow } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { SensoryLayout } from '../components/SensoryLayout';
import { ToggleIconButton } from '../components/ToggleIconButton';
import { TOUCH_AND_LISTEN_SOUNDS, type TouchAndListenSound } from '../constants/touchAndListenSounds';
import { TouchAndListenGame } from '../games/TouchAndListenGame';
import { useSensoryFeedback } from '../hooks/useSensoryFeedback';
import { useSensoryRuntime } from '../hooks/useSensoryRuntime';
import type { SensoryStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SensoryStackParamList, 'TouchAndListen'>;

const VOLUME_OPTIONS: { value: number; label: string }[] = [
  { value: 0.3, label: 'Bajo' },
  { value: 0.65, label: 'Medio' },
  { value: 1, label: 'Alto' },
];

/** Juego 4: botones causa-efecto grandes que reproducen un sonido corto (texto a voz local). */
export function TouchAndListenScreen({ navigation }: Props) {
  const runtime = useSensoryRuntime();
  const { playCue } = useSensoryFeedback();
  const [showControls, setShowControls] = useState(false);
  const [muted, setMuted] = useState(!runtime.soundEnabled);
  const [volume, setVolume] = useState(0.65);
  const [lastSound, setLastSound] = useState<TouchAndListenSound | null>(null);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(
    () => new Set(TOUCH_AND_LISTEN_SOUNDS.map((sound) => sound.id)),
  );

  function handlePlay(sound: TouchAndListenSound) {
    setLastSound(sound);
    playCue(sound.cue, !muted, volume);
  }

  function toggleSoundAvailable(id: string) {
    setEnabledIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        // No permitir dejar la pantalla sin ningún sonido disponible.
        if (next.size > 1) {
          next.delete(id);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <SensoryLayout
      title="🎵 Toca y escucha"
      onBack={() => navigation.goBack()}
      headerRight={
        <Pressable
          onPress={() => setShowControls((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel="Mostrar u ocultar ajustes del juego"
          style={styles.gearButton}
        >
          <Text style={styles.gearIcon}>⚙️</Text>
        </Pressable>
      }
    >
      {showControls ? (
        <ScrollView style={styles.controls} contentContainerStyle={styles.controlsContent}>
          <View style={styles.toggleRow}>
            <ToggleIconButton label="Sonido" iconOn="🔊" iconOff="🔇" value={!muted} onToggle={(v) => setMuted(!v)} />
            <View style={styles.toggleSpacer} />
            <BigButton
              label="Repetir"
              emoji="🔁"
              variant="secondary"
              fullWidth={false}
              disabled={!lastSound}
              onPress={() => lastSound && playCue(lastSound.cue, !muted, volume)}
            />
          </View>

          <Text style={styles.controlsLabel}>Volumen</Text>
          <OptionRow options={VOLUME_OPTIONS} value={volume} onChange={setVolume} />

          <Text style={styles.controlsLabel}>Sonidos disponibles</Text>
          <View style={styles.checklist}>
            {TOUCH_AND_LISTEN_SOUNDS.map((sound) => {
              const enabled = enabledIds.has(sound.id);
              return (
                <Pressable
                  key={sound.id}
                  onPress={() => toggleSoundAvailable(sound.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${sound.label}: ${enabled ? 'disponible' : 'oculto'}`}
                  accessibilityState={{ selected: enabled }}
                  style={[styles.checklistChip, enabled && styles.checklistChipSelected]}
                >
                  <Text style={styles.checklistChipText}>
                    {sound.emoji} {sound.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : null}

      <TouchAndListenGame enabledIds={enabledIds} onPlay={handlePlay} />
    </SensoryLayout>
  );
}

const styles = StyleSheet.create({
  gearButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: typography.sizes.lg,
  },
  controls: {
    maxHeight: 260,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  controlsContent: {
    padding: spacing.md,
  },
  controlsLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleSpacer: {
    width: spacing.sm,
  },
  checklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  checklistChip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  checklistChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checklistChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
});
