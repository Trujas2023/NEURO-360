import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
 * del comunicador. El botón "Calma" está siempre presente para que las
 * funciones esenciales (Calma, y desde ahí Ayuda/Baño/Dolor/No/Quiero)
 * sean alcanzables en como máximo un toque desde cualquier pantalla de
 * "Mi Voz" (ver sección de accesibilidad del prompt maestro).
 */
export function AacLayout({ title, onBack, children }: AacLayoutProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AacStackParamList>>();
  const { activeProfile } = useProfiles();
  const showPhraseBar = activeProfile?.preferences.showPhraseBar ?? DEFAULT_PROFILE_PREFERENCES.showPhraseBar;

  return (
    <ScreenContainer scrollable>
      {showPhraseBar ? <PhraseBar /> : null}

      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={onBack} />
          <BigButton label="Calma" emoji="😌" variant="secondary" fullWidth={false} onPress={() => navigation.navigate('AacCalm')} />
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
