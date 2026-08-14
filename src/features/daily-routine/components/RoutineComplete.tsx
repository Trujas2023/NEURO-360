import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

export interface RoutineCompleteProps {
  /** Sin animación de entrada; aparece ya visible. */
  reduceMotion?: boolean;
}

/**
 * Refuerzo al terminar una rutina: mensaje positivo y una aparición
 * suave. Deliberadamente discreto — sin confeti, sin rebotes, sin
 * sonidos fuertes — porque el objetivo es reconocer el logro, no
 * sobreestimular a quien acaba de completar algo que le costó.
 *
 * Es un componente solo de presentación: el sonido lo dispara la
 * pantalla en el momento exacto en que se completa el último paso (ver
 * `MyDayScreen`), así suena una sola vez y no en cada render.
 */
export function RoutineComplete({ reduceMotion = false }: RoutineCompleteProps) {
  // En estado y no en una ref: el valor animado se lee durante el render
  // (va en `style`), que es justo lo que una ref no debe hacer.
  const [appear] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    Animated.timing(appear, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [appear, reduceMotion]);

  return (
    <Animated.View
      accessibilityRole="alert"
      style={[
        styles.card,
        {
          opacity: appear,
          transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        },
      ]}
    >
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>¡Muy bien!</Text>
      <Text style={styles.subtitle}>Terminaste toda la rutina.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.success,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
