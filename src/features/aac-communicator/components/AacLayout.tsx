import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ScreenContainer } from '@shared/components';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { colors, spacing, typography } from '@shared/theme';

import type { AacStackParamList } from '../navigation/types';
import { PhraseBar } from './PhraseBar';

export interface AacLayoutProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

/**
 * Encabezado + barra de frase + contenido, compartido por las pantallas
 * del comunicador. Los botones "Inicio" y "Calma" (R1, ver
 * docs/DEFINITION_OF_DONE.md §7.1) están siempre presentes para que las
 * funciones esenciales sean alcanzables en como máximo un toque desde
 * cualquier pantalla de "Mi Voz". No se usa `ChildModeShell` aquí a
 * propósito: esta pantalla vive dentro de `AacNavigator` (anidado), y
 * `ChildModeShell` en R1 solo está probado para pantallas de nivel raíz
 * (ver su propio comentario) — se integran en R9. Mientras tanto, "Inicio"
 * usa el mismo patrón de `navigation.getParent()` que ya usa
 * `CalmCommunicationScreen` para llegar al navegador raíz.
 */
export function AacLayout({ title, onBack, children }: AacLayoutProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AacStackParamList>>();
  const { activeProfile } = useProfiles();
  const showPhraseBar =
    activeProfile?.preferences.showPhraseBar ?? DEFAULT_PROFILE_PREFERENCES.showPhraseBar;

  function goHome() {
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Home');
  }

  return (
    <ScreenContainer scrollable>
      {showPhraseBar ? <PhraseBar /> : null}

      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={onBack} />
          <BigButton
            label="Inicio"
            icon="home"
            variant="ghost"
            fullWidth={false}
            onPress={goHome}
          />
          <BigButton
            label="Calma"
            emoji="😌"
            variant="secondary"
            fullWidth={false}
            onPress={() => navigation.navigate('AacCalm')}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {children}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
