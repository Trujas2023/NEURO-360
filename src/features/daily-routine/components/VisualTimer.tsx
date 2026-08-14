import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, touchTargets, typography } from '@shared/theme';

const TICK_MS = 500;
const SEGMENT_COUNT = 10;

export interface VisualTimerProps {
  durationSeconds: number;
  /**
   * Con `reduceMotion` la barra se dibuja en bloques que se apagan de a
   * uno en vez de vaciarse de forma continua: sigue comunicando "queda
   * menos tiempo" sin movimiento permanente en pantalla.
   */
  reduceMotion?: boolean;
}

/**
 * Temporizador visual de un paso: representa el tiempo restante como una
 * barra que se vacía, nunca como números. La idea es que sirva a quien
 * todavía no lee la hora — ver cuánto queda, no calcularlo.
 *
 * El paso NO se marca solo al terminar: quién decide que algo terminó es
 * la persona, no el reloj. Al llegar a cero solo cambia el color.
 *
 * Se monta con `key={step.id}` desde la pantalla, así cambiar de paso
 * crea una instancia nueva y el tiempo arranca limpio.
 */
export function VisualTimer({ durationSeconds, reduceMotion = false }: VisualTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [started, setStarted] = useState(false);

  const isRunning = started && remaining > 0;
  const finished = remaining <= 0;
  const progress = durationSeconds > 0 ? Math.max(0, remaining / durationSeconds) : 0;

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const id = setInterval(() => {
      setRemaining((current) => Math.max(0, current - TICK_MS / 1000));
    }, TICK_MS);

    return () => clearInterval(id);
  }, [isRunning]);

  const fillColor = finished ? colors.success : colors.primary;
  const filledSegments = Math.ceil(progress * SEGMENT_COUNT);

  return (
    <View style={styles.container}>
      <View
        style={styles.track}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={finished ? 'Tiempo terminado' : 'Tiempo restante'}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      >
        {reduceMotion ? (
          <View style={styles.segments}>
            {Array.from({ length: SEGMENT_COUNT }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.segment,
                  { backgroundColor: index < filledSegments ? fillColor : colors.border },
                ]}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: fillColor }]} />
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => setStarted((current) => !current)}
          disabled={finished}
          accessibilityRole="button"
          accessibilityLabel={started ? 'Pausar el tiempo' : 'Empezar el tiempo'}
          style={({ pressed }) => [
            styles.button,
            { opacity: finished ? 0.4 : pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>{started ? '⏸ Pausa' : '▶️ Empezar'}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setStarted(false);
            setRemaining(durationSeconds);
          }}
          accessibilityRole="button"
          accessibilityLabel="Reiniciar el tiempo"
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.75 : 1 }]}
        >
          <Text style={styles.buttonText}>🔄 Reiniciar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  track: {
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  segments: {
    flexDirection: 'row',
    height: '100%',
    gap: 2,
  },
  segment: {
    flex: 1,
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
