import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { APP_NAME } from '@shared/constants/app';
import { colors, spacing, typography } from '@shared/theme';

/**
 * Composición raíz de la app. En Fase 1 solo confirma que la arquitectura
 * (alias, tema, constantes compartidas) queda cableada de punta a punta.
 * La Fase 2 sustituye esta pantalla por el navegador raíz y la selección
 * de perfil / modo.
 */
export default function RootApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.subtitle}>Fase 1: arquitectura del proyecto ✔</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
