import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

/**
 * `good` celebra un acierto; `retry` invita a probar de nuevo. No existe
 * un estado de "error": equivocarse no resta, no interrumpe y no
 * descalifica, así que no hace falta representarlo.
 */
export type GameFeedback = 'none' | 'good' | 'retry';

export interface GameFrameProps {
  title: string;
  onExit: () => void;
  /** Ronda actual y total; se muestra como progreso, nunca como cuenta regresiva. */
  round?: { current: number; total: number };
  feedback?: GameFeedback;
  children: ReactNode;
  footer?: ReactNode;
}

const FEEDBACK_TEXT: Record<Exclude<GameFeedback, 'none'>, string> = {
  good: '¡Bien!',
  retry: 'Intentemos otra vez.',
};

/**
 * Marco común de los juegos. Igual que en Mundo Sensorial, "Terminar"
 * está siempre visible: salir nunca depende de completar la partida.
 *
 * El progreso se muestra como "ronda X de Y" y jamás como tiempo
 * restante — un cronómetro en cuenta regresiva presiona, y la presión es
 * lo contrario de lo que estos juegos buscan.
 */
export function GameFrame({ title, onExit, round, feedback = 'none', children, footer }: GameFrameProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {round ? (
            <Text style={styles.round}>
              Ronda {round.current} de {round.total}
            </Text>
          ) : null}
        </View>
        <BigButton label="Terminar" variant="secondary" fullWidth={false} onPress={onExit} />
      </View>

      {feedback !== 'none' ? (
        <View
          style={[styles.feedback, feedback === 'good' ? styles.feedbackGood : styles.feedbackRetry]}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.feedbackText}>{FEEDBACK_TEXT[feedback]}</Text>
        </View>
      ) : null}

      <View style={styles.content}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  round: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  feedback: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  feedbackGood: {
    backgroundColor: colors.surface,
    borderColor: colors.success,
  },
  feedbackRetry: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  feedbackText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
