import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { QuickCommunication } from '../components/QuickCommunication';
import type { AacStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AacStackParamList, 'AacCalm'>;

/**
 * Calma 360: panel de comunicación rápida para momentos de crisis o
 * sobreestimulación, alcanzable en un toque desde cualquier pantalla de
 * "Mi Voz" (ver botón "Calma" en `AacLayout`). Enlaza a Mundo Sensorial
 * sin modificar su lógica interna (ese módulo todavía es un stub —
 * `ComingSoonScreen` — ver docs/AAC_PRO_FASE2_PLAN.md).
 */
export function CalmCommunicationScreen({ navigation }: Props) {
  const parentNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerButtons}>
        <BigButton
          label="Volver"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.goBack()}
        />
        <BigButton
          label="Inicio"
          icon="home"
          variant="ghost"
          fullWidth={false}
          onPress={() => parentNavigation?.navigate('Home')}
        />
      </View>

      <Text style={styles.title}>😌 Calma</Text>
      <Text style={styles.subtitle}>Toca una frase para escucharla al instante</Text>

      <QuickCommunication />

      <View style={styles.footer}>
        <BigButton
          label="Ir a Mundo Sensorial"
          emoji="🎮"
          variant="secondary"
          onPress={() =>
            parentNavigation?.navigate('ComingSoon', { title: 'Mundo Sensorial', emoji: '🎮' })
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
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
  footer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
