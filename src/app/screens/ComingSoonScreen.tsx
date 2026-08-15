import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ChildModeShell } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ComingSoon'>;

/**
 * Pantalla temporal para secciones que se implementan en fases
 * posteriores (hoy: únicamente Mundo Sensorial, ver R3 en
 * docs/REBUILD_ROADMAP_R1_R10.md). Marcada explícitamente como pendiente
 * — nunca se cuenta como una funcionalidad terminada (ver
 * docs/PRODUCT_MASTER_SPEC.md §0, requisito 10 de R1). Envuelta en
 * `ChildModeShell` para que un niño que llegue aquí nunca quede sin
 * salida (Inicio/Calma siempre disponibles, cierra el mismo defecto de
 * UX que Mundo Sensorial tenía como stub sin salida clara).
 */
export function ComingSoonScreen({ route, navigation }: Props) {
  const { title, emoji } = route.params;

  return (
    <ChildModeShell centered>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>
        Esta sección todavía se está construyendo (ver el roadmap de reconstrucción).
      </Text>
      <BigButton
        label="Volver"
        variant="secondary"
        fullWidth={false}
        onPress={() => navigation.goBack()}
      />
    </ChildModeShell>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
