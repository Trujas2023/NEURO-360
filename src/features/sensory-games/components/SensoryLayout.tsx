import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@shared/theme';

export interface SensoryLayoutProps {
  title: string;
  onBack: () => void;
  /** Controles cortos del juego (ej. mute, velocidad) que van junto al título. */
  headerRight?: ReactNode;
  children: ReactNode;
}

/**
 * Encabezado compacto (← Volver + título) y el resto de la pantalla para
 * el juego. A propósito no reutiliza `ScreenContainer`: los juegos
 * necesitan aprovechar todo el espacio disponible en vez del padding
 * pensado para pantallas de texto/formularios.
 */
export function SensoryLayout({ title, onBack, headerRight, children }: SensoryLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRight}>{headerRight}</View>
      </View>
      <View style={styles.content}>{children}</View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: {
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
  },
  title: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
});
