import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

export interface ActivityFrameProps {
  title: string;
  onFinish: () => void;
  children: ReactNode;
  /** Controles del adulto/niño que van debajo del área de actividad. */
  footer?: ReactNode;
}

/**
 * Marco común de las actividades sensoriales. Su regla principal es que
 * **"Terminar" está siempre visible**: ninguna actividad atrapa al niño,
 * y salir nunca depende de completar nada ni de esperar un cronómetro.
 *
 * No usa `ScreenContainer` porque las actividades necesitan un lienzo que
 * ocupe todo el alto disponible, sin scroll ni padding interno.
 */
export function ActivityFrame({ title, onFinish, children, footer }: ActivityFrameProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <BigButton label="Terminar" variant="secondary" fullWidth={false} onPress={onFinish} />
      </View>

      <View style={styles.canvas}>{children}</View>

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
  title: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  canvas: {
    flex: 1,
    overflow: 'hidden',
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
