import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { MainTabParamList, RootStackParamList } from '@app/navigation/types';
import { QuickCommunication } from '@features/aac-communicator/components/QuickCommunication';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { EMERGENCY_VOCABULARY } from '../data/emergencyVocabulary';

type Props = BottomTabScreenProps<MainTabParamList, 'Calma'>;

/**
 * Calma 360: panel de comunicación rápida para momentos de crisis o
 * sobreestimulación. Es uno de los cuatro tabs principales (siempre a un
 * toque de distancia, ver `MainTabs`), así que no tiene botón "Volver":
 * se sale cambiando de tab.
 *
 * Dos frases ofrecen además un flujo guiado opcional ("Contar más") para
 * precisar qué pasa: dolor y saturación/miedo. Enlaza a Mundo Sensorial
 * sin modificar su lógica interna (ese módulo todavía es un stub —
 * `ComingSoonScreen` — ver docs/V2_ARCHITECTURE_AUDIT.md).
 */
export function CalmCommunicationScreen({ navigation }: Props) {
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer scrollable topInset={false}>
      <Text style={styles.title}>😌 Calma</Text>
      <Text style={styles.subtitle}>Toca una frase para escucharla al instante</Text>

      <QuickCommunication
        phrases={EMERGENCY_VOCABULARY}
        onDetail={(phrase) => {
          if (phrase.detail === 'pain') {
            rootNavigation?.navigate('CalmPain');
          } else if (phrase.detail === 'overwhelm') {
            rootNavigation?.navigate('CalmOverwhelm');
          }
        }}
      />

      <View style={styles.footer}>
        <BigButton
          label="Ir a Mundo Sensorial"
          emoji="🌈"
          variant="secondary"
          onPress={() => rootNavigation?.navigate('SensoryHome')}
        />
      </View>
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
  footer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
