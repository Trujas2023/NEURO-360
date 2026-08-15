import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@app/navigation/types';
import { colors, hairline, spacing } from '@shared/theme';

import { BigButton } from './BigButton';

export interface ChildModeShellProps {
  children: ReactNode;
  scrollable?: boolean;
  centered?: boolean;
}

/**
 * Barra universal Inicio/Calma (R1, ver docs/PRODUCT_MASTER_SPEC.md §1.2,
 * §1.4; docs/DEFINITION_OF_DONE.md §7.1). Reemplaza a `ScreenContainer`
 * como envoltorio raíz de una pantalla de Modo Niño: acceso de un toque a
 * Home y a Calma sin importar cuánto haya navegado el niño.
 *
 * "Calma" navega al panel real de comunicación de emergencia que ya
 * existe hoy (`AacCalm`, dentro de `AacCommunicator`) — no es un
 * placeholder, es contenido funcional; solo su ubicación arquitectónica
 * (módulo de primer nivel independiente) se termina de mover en R4.
 *
 * Alcance de R1: se usa en `HomeScreen`, `MyDayScreen` y la pantalla
 * pendiente de Mundo Sensorial (`ComingSoonScreen`) — las tres pantallas
 * de nivel raíz que antes no tenían ningún acceso a Calma. Las
 * subpantallas anidadas de Mi Voz (`AacLayout`, `CalmCommunicationScreen`)
 * no usan este componente porque `useNavigation()` ahí resuelve al
 * navegador anidado de `AacNavigator`, no a la raíz — en su lugar tienen
 * su propio botón "Inicio" vía `navigation.getParent()` (mismo resultado
 * para el usuario, implementación distinta por la posición en el árbol de
 * navegación). Entre ambos caminos, el 100% de las pantallas de Modo Niño
 * ya tiene Inicio y Calma alcanzables en un toque desde R1. Unificar
 * ambos caminos bajo un solo componente (con resolución de navegador raíz
 * genérica) queda como pulido de R9.
 */
export function ChildModeShell({
  children,
  scrollable = false,
  centered = false,
}: ChildModeShellProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  function goHome() {
    navigation.navigate('Home');
  }

  function goCalm() {
    navigation.navigate('AacCommunicator', { screen: 'AacCalm' });
  }

  const content = <View style={[styles.content, centered && styles.centered]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView>
      ) : (
        content
      )}

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <View style={styles.barButton}>
          <BigButton
            label="Inicio"
            icon="home"
            variant="secondary"
            onPress={goHome}
            accessibilityHint="Vuelve a la pantalla principal"
          />
        </View>
        <View style={styles.barButton}>
          <BigButton
            label="Calma"
            emoji="😌"
            variant="secondary"
            onPress={goCalm}
            accessibilityHint="Abre frases de comunicación rápida para momentos difíciles"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: hairline,
    borderTopColor: colors.border,
  },
  barButton: {
    flex: 1,
  },
});
