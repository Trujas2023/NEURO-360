import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@app/navigation/types';
import { colors, radius, spacing, touchTargets, typography } from '@shared/theme';

/**
 * Franja delgada, compartida por los cuatro tabs principales de
 * `MainTabs`: solo trae el acceso a Ayuda, para que quede a un toque de
 * distancia sin importar en qué módulo esté el niño (Inicio/Mi Voz/Calma/
 * Mi Día), sin duplicar el control pantalla por pantalla.
 */
export function MainTabHeader({ navigation }: BottomTabHeaderProps) {
  const insets = useSafeAreaInsets();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <Pressable
        onPress={() => rootNavigation?.navigate('Help')}
        accessibilityRole="button"
        accessibilityLabel="Ayuda"
        accessibilityHint="Abre frases rápidas de ayuda"
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={styles.emoji}>🆘</Text>
        <Text style={styles.label}>Ayuda</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: touchTargets.minimum,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  emoji: {
    fontSize: typography.sizes.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.danger,
  },
});
