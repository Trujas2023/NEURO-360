import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

import { SENSORY_NEEDS } from '../data/activities';
import type { SensoryActivityId } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensoryHome'>;

/** Rutas de actividad; todas sin parámetros, lo que permite navegar con la clave calculada. */
type SensoryActivityRoute =
  | 'SensoryBubbles'
  | 'SensoryBreathing'
  | 'SensoryTracking'
  | 'SensoryPaint'
  | 'SensoryCauseEffect';

const ROUTE_BY_ACTIVITY: Record<SensoryActivityId, SensoryActivityRoute> = {
  bubbles: 'SensoryBubbles',
  breathing: 'SensoryBreathing',
  tracking: 'SensoryTracking',
  paint: 'SensoryPaint',
  causeEffect: 'SensoryCauseEffect',
};

/**
 * Entrada a Mundo Sensorial. Pregunta por la necesidad y no por la
 * actividad ("¿qué necesitas ahora?" en vez de "elegí un juego"): el
 * niño rara vez sabe cómo se llama la actividad, pero sí puede
 * reconocer qué le está pasando. Cada opción abre su actividad directo,
 * así nada queda a más de dos toques.
 */
export function SensoryHomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer scrollable>
      <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => navigation.goBack()} />

      <Text style={styles.title}>🌈 Mundo Sensorial</Text>
      <Text style={styles.subtitle}>¿Qué necesitas ahora?</Text>

      <View style={styles.grid}>
        {SENSORY_NEEDS.map((need) => (
          <Pressable
            key={need.id}
            onPress={() => navigation.navigate(ROUTE_BY_ACTIVITY[need.activity])}
            accessibilityRole="button"
            accessibilityLabel={need.label}
            style={({ pressed }) => [styles.card, { borderColor: need.color, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.emoji}>{need.emoji}</Text>
            <Text style={styles.label}>{need.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.md,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  card: {
    width: 150,
    minHeight: 130,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  emoji: {
    fontSize: 44,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
