import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { QuickCommunication } from '@features/aac-communicator/components/QuickCommunication';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { HELP_VOCABULARY } from '../data/helpVocabulary';

type Props = NativeStackScreenProps<RootStackParamList, 'Help'>;

/**
 * Ayuda: frases de auxilio inmediato, alcanzable en un toque desde
 * cualquier tab principal (ver `MainTabHeader`) y desde el botón de Home.
 * Cada frase habla de inmediato al tocarla, igual que Calma 360.
 */
export function HelpScreen({ navigation }: Props) {
  return (
    <ScreenContainer scrollable>
      <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => navigation.goBack()} />

      <Text style={styles.title}>🆘 Ayuda</Text>
      <Text style={styles.subtitle}>Toca una frase para escucharla al instante</Text>

      <QuickCommunication phrases={HELP_VOCABULARY} />
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
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
