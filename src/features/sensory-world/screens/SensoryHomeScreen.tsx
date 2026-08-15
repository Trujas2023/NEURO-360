import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, EntityGridCard, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { SENSORY_NEEDS } from '../data/activities';
import type { SensoryActivityId } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SensoryHome'>;

/** Rutas de actividad; todas sin parámetros, lo que permite navegar con la clave calculada. */
type SensoryActivityRoute =
  | 'SensoryBubbles'
  | 'SensoryBreathing'
  | 'SensoryTracking'
  | 'SensoryPaint'
  | 'SensoryCauseEffect'
  | 'SensorySoundRhythm'
  | 'SensoryAquarium';

const ROUTE_BY_ACTIVITY: Record<SensoryActivityId, SensoryActivityRoute> = {
  bubbles: 'SensoryBubbles',
  breathing: 'SensoryBreathing',
  tracking: 'SensoryTracking',
  paint: 'SensoryPaint',
  causeEffect: 'SensoryCauseEffect',
  soundRhythm: 'SensorySoundRhythm',
  aquarium: 'SensoryAquarium',
};

/**
 * Entrada a Mundo Sensorial. Pregunta por la necesidad y no por la
 * actividad ("¿qué necesitas ahora?" en vez de "elegí un juego"): el
 * niño rara vez sabe cómo se llama la actividad, pero sí puede
 * reconocer qué le está pasando. Cada opción abre su actividad directo,
 * así nada queda a más de dos toques.
 *
 * Grilla con `EntityGridCard` (Fase 7F) — este era uno de los 4 patrones
 * de tarjeta casi idénticos señalados en `docs/V7_PRODUCT_AUDIT.md` §7.7.
 */
export function SensoryHomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer scrollable>
      <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => navigation.goBack()} />

      <Text style={styles.title}>🌈 Mundo Sensorial</Text>
      <Text style={styles.subtitle}>¿Qué necesitas ahora?</Text>

      <View style={styles.grid}>
        {SENSORY_NEEDS.map((need) => (
          <EntityGridCard
            key={need.id}
            emoji={need.emoji}
            label={need.label}
            accentColor={need.color}
            accessibilityLabel={need.label}
            onPress={() => navigation.navigate(ROUTE_BY_ACTIVITY[need.activity])}
          />
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
});
