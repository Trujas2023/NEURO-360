import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ProfileAvatar, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

/** Pantalla principal de Modo Niño: solo comunicador y juegos, nada de configuración. */
export function HomeScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();

  useEffect(() => {
    if (!activeProfile) {
      navigation.replace('ProfileSelector');
    }
  }, [activeProfile, navigation]);

  if (!activeProfile) {
    return null;
  }

  return (
    <ScreenContainer>
      <View style={styles.profileRow}>
        <ProfileAvatar
          name={activeProfile.name}
          avatarUri={activeProfile.avatarUri}
          avatarColor={activeProfile.avatarColor}
          size={56}
        />
        <Text style={styles.profileName}>{activeProfile.name}</Text>
      </View>

      <View style={styles.actions}>
        <BigButton
          label="Mi Voz"
          emoji="🗣️"
          onPress={() => navigation.navigate('AacCommunicator')}
          accessibilityHint="Abre el comunicador de tarjetas"
        />
        <View style={styles.spacer} />
        <BigButton
          label="Juega & Regula"
          emoji="🎮"
          variant="secondary"
          onPress={() => navigation.navigate('SensoryGames')}
          accessibilityHint="Abre los juegos sensoriales"
        />
        <View style={styles.spacer} />
        <BigButton
          label="Mi Día"
          emoji="🗓️"
          variant="secondary"
          onPress={() => navigation.navigate('MyDay')}
          accessibilityHint="Abre la agenda visual de rutinas"
        />
      </View>

      <View style={styles.footer}>
        <BigButton
          label="Cambiar perfil"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.navigate('ProfileSelector')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    marginLeft: spacing.md,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
  },
  spacer: {
    height: spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
});
