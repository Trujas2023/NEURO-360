import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { ActivityFrame } from '../components/ActivityFrame';
import { useSensorySettings } from '../hooks/useSensorySettings';
import { BREATHING_TIMINGS } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensoryBreathing'>;

type Phase = 'inhale' | 'hold' | 'exhale';

const PHASE_LABEL: Record<Phase, string> = {
  inhale: 'Inhala',
  hold: 'Mantén',
  exhale: 'Exhala',
};

const MIN_SCALE = 0.45;

/**
 * Círculo que crece y se achica siguiendo un ritmo de respiración. El
 * patrón (inhalar-mantener-exhalar) lo elige un adulto en los ajustes.
 *
 * Es una actividad de acompañamiento, no un tratamiento: en ningún lado
 * se afirma un efecto sobre la salud ni se dan indicaciones médicas.
 */
export function BreathingScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const { settings } = useSensorySettings(activeProfile?.id ?? null);

  const [scale] = useState(() => new Animated.Value(MIN_SCALE));
  const [phase, setPhase] = useState<Phase>('inhale');
  const [running, setRunning] = useState(true);

  const timings = BREATHING_TIMINGS[settings.breathingPattern];

  useEffect(() => {
    if (!running) {
      return;
    }

    let cancelled = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;

    // La primera fase se anima directamente; `setPhase` solo se llama
    // dentro de callbacks asíncronos, nunca en el cuerpo del efecto.
    function cycle() {
      if (cancelled) {
        return;
      }

      Animated.timing(scale, {
        toValue: 1,
        duration: timings.inhale * 1000,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || cancelled) {
          return;
        }
        setPhase('hold');

        holdTimer = setTimeout(() => {
          if (cancelled) {
            return;
          }
          setPhase('exhale');

          Animated.timing(scale, {
            toValue: MIN_SCALE,
            duration: timings.exhale * 1000,
            useNativeDriver: true,
          }).start(({ finished: exhaleFinished }) => {
            if (!exhaleFinished || cancelled) {
              return;
            }
            setPhase('inhale');
            cycle();
          });
        }, timings.hold * 1000);
      });
    }

    cycle();

    return () => {
      cancelled = true;
      if (holdTimer) {
        clearTimeout(holdTimer);
      }
      scale.stopAnimation();
    };
  }, [running, timings, scale]);

  return (
    <ActivityFrame
      title="🌬️ Respira conmigo"
      onFinish={() => navigation.goBack()}
      footer={
        <BigButton
          label={running ? 'Pausar' : 'Continuar'}
          emoji={running ? '⏸' : '▶️'}
          variant="secondary"
          onPress={() => setRunning((current) => !current)}
        />
      }
    >
      <View style={styles.canvas}>
        <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
        <Text style={styles.phase} accessibilityLiveRegion="polite">
          {PHASE_LABEL[phase]}
        </Text>
        <Text style={styles.pattern}>{settings.breathingPattern.split('-').join(' · ')}</Text>
      </View>
    </ActivityFrame>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.55,
  },
  phase: {
    position: 'absolute',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  pattern: {
    marginTop: spacing.xl * 5,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
