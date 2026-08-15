import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MainTabParamList, RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, EntityGridCard, ProfileAvatar, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'Inicio'>;

/**
 * Raíz del tab "Inicio": saludo, acceso principal a "Mi Voz" y una grilla
 * con los otros 4 sistemas (Calma, Sensorial, Jugar, Mi Día) con el mismo
 * tratamiento visual entre sí — dos de ellos también son tabs de la barra
 * inferior y dos no, pero ninguno se lee como "más importante" que los
 * demás desde Inicio (corrige `docs/V7_PRODUCT_AUDIT.md` §6.6: antes
 * Calma/Mi Día tenían un trato distinto al de Sensorial/Jugar). Los
 * íconos reusan los mismos de `MainTabs`/`AdultCenterScreen` para el
 * mismo destino, para que el lenguaje visual sea consistente en toda la
 * app.
 */
export function HomeScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();
  const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!activeProfile) {
      rootNavigation?.replace('ProfileSelector');
    }
  }, [activeProfile, rootNavigation]);

  if (!activeProfile) {
    return null;
  }

  return (
    <ScreenContainer scrollable topInset={false}>
      <View style={styles.profileRow}>
        <ProfileAvatar
          name={activeProfile.name}
          avatarUri={activeProfile.avatarUri}
          avatarColor={activeProfile.avatarColor}
          size={56}
        />
        <Text style={styles.profileName}>Hola, {activeProfile.name} 👋</Text>
      </View>

      <View style={styles.primaryAction}>
        <BigButton
          label="Quiero comunicarme"
          emoji="🗣️"
          onPress={() => navigation.navigate('MiVoz')}
          accessibilityHint="Abre el comunicador Mi Voz"
        />
      </View>

      <View style={styles.grid}>
        <EntityGridCard
          icon="happy"
          label="Calma"
          accentColor={colors.warning}
          accessibilityLabel="Calma"
          accessibilityHint="Abre frases de comunicación rápida para momentos difíciles"
          onPress={() => navigation.navigate('Calma')}
        />
        <EntityGridCard
          icon="leaf"
          label="Sensorial"
          accentColor={colors.lavender}
          accessibilityLabel="Mundo Sensorial"
          accessibilityHint="Abre las actividades de regulación sensorial"
          onPress={() => rootNavigation?.navigate('SensoryHome')}
        />
        <EntityGridCard
          icon="game-controller"
          label="Jugar"
          accentColor={colors.accent}
          accessibilityLabel="Juega y Regula"
          accessibilityHint="Abre los juegos"
          onPress={() => rootNavigation?.navigate('GamesHome')}
        />
        <EntityGridCard
          icon="calendar"
          label="Mi Día"
          accentColor={colors.secondary}
          accessibilityLabel="Mi Día"
          accessibilityHint="Abre la agenda visual de rutinas"
          onPress={() => navigation.navigate('MiDia')}
        />
      </View>

      <View style={styles.helpAction}>
        <BigButton
          label="Ayuda"
          emoji="🆘"
          variant="danger"
          fullWidth={false}
          onPress={() => rootNavigation?.navigate('Help')}
          accessibilityHint="Abre frases de auxilio inmediato"
        />
      </View>

      <View style={styles.footer}>
        <BigButton
          label="Cambiar perfil"
          variant="ghost"
          fullWidth={false}
          onPress={() => rootNavigation?.navigate('ProfileSelector')}
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
  primaryAction: {
    marginTop: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  helpAction: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
