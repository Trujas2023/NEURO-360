import {
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { persistRecording } from '@services/audio';
import { BigButton } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

export interface VoiceRecorderFieldProps {
  /** URI persistente de la grabación actual de la tarjeta, si tiene una. */
  audioUri?: string;
  /**
   * Se llama con el nuevo URI al terminar de grabar, o con `undefined` al
   * eliminar la grabación. Quien llama decide cuándo se persiste
   * realmente (al guardar la tarjeta): este campo nunca borra archivos
   * por su cuenta, así cancelar el formulario nunca deja una tarjeta con
   * una referencia rota a un audio que ya no existe.
   */
  onChange: (uri: string | undefined) => void;
}

function formatDuration(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Grabación de voz personalizada para una tarjeta AAC ("+ Nueva
 * tarjeta" → Modo Adulto, protegido por PIN igual que el resto del
 * formulario). Reemplaza al TTS para esa tarjeta cuando existe.
 *
 * Reglas de permisos: el micrófono se pide únicamente al tocar "Grabar
 * voz" (nunca al abrir la pantalla ni al iniciar la app), y siempre
 * después de una explicación en pantalla de para qué se usa.
 */
export function VoiceRecorderField({ audioUri, onChange }: VoiceRecorderFieldProps) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // "Listo para reproducir" se deriva del propio estado del reproductor
  // (`isLoaded`) en vez de un `useState` propio: así el efecto de abajo
  // solo sincroniza la fuente del reproductor con `audioUri`, sin volver a
  // llamar a `setState` de forma síncrona dentro del efecto.
  const playerReady = playerStatus.isLoaded;

  useEffect(() => {
    if (!audioUri) {
      return;
    }
    try {
      player.replace({ uri: audioUri });
    } catch {
      // Si falla, `playerStatus.isLoaded` queda en `false` y "Escuchar"
      // sigue deshabilitado; no hay nada más que sincronizar acá.
    }
    // Solo depende de audioUri a propósito: `player` es una instancia
    // estable durante toda la vida del componente (la gestiona el hook).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUri]);

  function explainAndRequestPermission(onGranted: () => void) {
    Alert.alert(
      'Usar el micrófono',
      'Sense & Play Adventures 360 va a pedir acceso al micrófono para grabar tu voz en esta tarjeta. La grabación se guarda solo en este dispositivo: nunca se sube a internet.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: async () => {
            try {
              const result = await requestRecordingPermissionsAsync();
              if (result.granted) {
                onGranted();
              } else {
                setError('No diste permiso de micrófono. La tarjeta puede seguir usando voz sintética (TTS).');
              }
            } catch {
              setError('No se pudo pedir el permiso de micrófono. Intenta de nuevo.');
            }
          },
        },
      ],
    );
  }

  async function beginRecording() {
    try {
      setError(null);
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      setError('No se pudo iniciar la grabación. Revisa que el micrófono esté disponible.');
    }
  }

  async function handleStartPress() {
    setError(null);
    try {
      const current = await getRecordingPermissionsAsync();
      if (current.granted) {
        await beginRecording();
        return;
      }
      if (!current.canAskAgain) {
        Alert.alert(
          'Permiso de micrófono desactivado',
          'Activa el permiso de micrófono para esta app desde los ajustes del sistema para poder grabar. Mientras tanto, la tarjeta puede seguir usando voz sintética.',
        );
        return;
      }
      explainAndRequestPermission(beginRecording);
    } catch {
      setError('No se pudo comprobar el permiso de micrófono.');
    }
  }

  async function handleStop() {
    try {
      await recorder.stop();
      const temporaryUri = recorder.uri;
      if (!temporaryUri) {
        setError('No se guardó ninguna grabación. Intenta de nuevo.');
        return;
      }
      setSaving(true);
      const persistedUri = await persistRecording(temporaryUri);
      onChange(persistedUri);
    } catch {
      setError('Hubo un problema al guardar la grabación. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleListen() {
    if (!audioUri || !playerReady) {
      return;
    }
    try {
      setError(null);
      await player.seekTo(0);
      player.play();
    } catch {
      setError('No se pudo reproducir la grabación.');
    }
  }

  function handleDiscard() {
    try {
      player.pause();
    } catch {
      // no-op
    }
    onChange(undefined);
    setError(null);
  }

  const isRecording = recorderState.isRecording;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🎙️ Voz grabada (opcional)</Text>
      <Text style={styles.hint}>
        Si grabas tu voz, la tarjeta la reproduce en vez del texto a voz. Sin grabación, sigue funcionando con TTS.
      </Text>

      {isRecording ? (
        <View style={styles.recordingRow}>
          <View style={styles.recordingDot} accessibilityElementsHidden />
          <Text style={styles.recordingText}>Grabando… {formatDuration(recorderState.durationMillis)}</Text>
        </View>
      ) : null}

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {saving ? (
        <View style={styles.savingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.hint}>Guardando grabación…</Text>
        </View>
      ) : isRecording ? (
        <BigButton label="Detener" emoji="⏹️" variant="danger" onPress={handleStop} />
      ) : audioUri ? (
        <View style={styles.buttonGroup}>
          <View style={styles.buttonItem}>
            <BigButton
              label={playerStatus.playing ? 'Reproduciendo…' : 'Escuchar'}
              emoji="▶️"
              variant="secondary"
              onPress={handleListen}
              disabled={!playerReady || playerStatus.playing}
            />
          </View>
          <View style={styles.buttonItem}>
            <BigButton label="Volver a grabar" emoji="🎙️" variant="secondary" onPress={handleStartPress} />
          </View>
          <View style={styles.buttonItem}>
            <BigButton label="Eliminar grabación" emoji="🗑️" variant="ghost" onPress={handleDiscard} />
          </View>
        </View>
      ) : (
        <BigButton label="Grabar voz" emoji="🎙️" variant="secondary" onPress={handleStartPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  hint: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.danger,
  },
  recordingText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.danger,
  },
  error: {
    marginBottom: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.danger,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  buttonItem: {
    flexBasis: '31%',
    flexGrow: 1,
  },
});
