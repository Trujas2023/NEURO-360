import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { persistLocalFile } from '@services/media/localFiles';
import { BigButton } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

export interface AudioRecorderFieldProps {
  /** URI persistente ya grabada, si existe. */
  value?: string;
  onChange: (uri: string | undefined) => void;
}

/**
 * Grabar / reproducir / volver a grabar / eliminar una voz personalizada
 * para una tarjeta. Componente controlado: no decide cuándo borrar el
 * archivo anterior de `value` (eso lo maneja la pantalla que lo usa, igual
 * que con las fotos), solo persiste la nueva grabación y avisa con
 * `onChange`.
 */
export function AudioRecorderField({ value, onChange }: AudioRecorderFieldProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const [busy, setBusy] = useState(false);

  async function startRecording() {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Activa el acceso al micrófono para grabar una voz. Podés seguir usando texto a voz sin grabar.',
        );
        return;
      }
      await setAudioModeAsync({ allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('No se pudo grabar', 'Intenta de nuevo o usa texto a voz para esta tarjeta.');
    }
  }

  async function stopRecording() {
    setBusy(true);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        return;
      }
      const persisted = await persistLocalFile(uri, 'card-audio', 'm4a');
      onChange(persisted);
    } catch {
      Alert.alert('No se pudo guardar la grabación', 'Intenta de nuevo o usa texto a voz para esta tarjeta.');
    } finally {
      setBusy(false);
    }
  }

  function playRecording() {
    if (!value) {
      return;
    }
    try {
      player.replace({ uri: value });
      player.play();
    } catch {
      Alert.alert('No se pudo reproducir', 'La grabación podría estar dañada.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        {recorderState.isRecording
          ? `Grabando… ${Math.round(recorderState.durationMillis / 1000)}s`
          : value
            ? 'Voz personalizada guardada para esta tarjeta.'
            : 'Sin voz personalizada: se usará texto a voz.'}
      </Text>

      <View style={styles.row}>
        {recorderState.isRecording ? (
          <BigButton label="Detener" emoji="⏹️" variant="danger" onPress={stopRecording} disabled={busy} />
        ) : (
          <BigButton
            label={value ? 'Volver a grabar' : 'Grabar voz'}
            emoji="🎙️"
            variant="secondary"
            onPress={startRecording}
            disabled={busy}
          />
        )}
      </View>

      {value ? (
        <View style={styles.row}>
          <View style={styles.halfButton}>
            <BigButton
              label={playerStatus.playing ? 'Reproduciendo…' : 'Reproducir'}
              emoji="▶️"
              variant="ghost"
              onPress={playRecording}
              disabled={playerStatus.playing || recorderState.isRecording}
            />
          </View>
          <View style={styles.halfButton}>
            <BigButton
              label="Eliminar"
              emoji="🗑️"
              variant="ghost"
              onPress={() => onChange(undefined)}
              disabled={recorderState.isRecording}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  status: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  halfButton: {
    flex: 1,
  },
});
