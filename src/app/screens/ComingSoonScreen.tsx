import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ComingSoon'>;

/** Pantalla temporal para secciones que se implementan en fases posteriores. */
export function ComingSoonScreen({ route, navigation }: Props) {
  const { title, emoji } = route.params;

  return (
    <ScreenContainer centered>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>Esta sección estará disponible próximamente.</Text>
      <BigButton label="Volver" variant="secondary" onPress={() => navigation.goBack()} />
    </ScreenContainer>
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
