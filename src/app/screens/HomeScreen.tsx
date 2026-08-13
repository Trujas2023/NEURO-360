import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MainTabParamList, RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ProfileAvatar, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

type Props = BottomTabScreenProps<MainTabParamList, 'Inicio'>;

/**
 * Raíz del tab "Inicio": saludo, acceso principal a "Mi Voz" y accesos
 * directos a Calma y Mi Día (además de siempre estar a un toque vía la
 * barra inferior). Mundo Sensorial y Juega & Regula todavía no tienen
 * módulo real (ver `docs/V2_ARCHITECTURE_AUDIT.md`), así que no se
 * muestran como botones aquí — solo una nota de que llegan más adelante,
 * para no dejar accesos "muertos" en la navegación principal.
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
        <View style={styles.gridItem}>
          <BigButton
            label="Calma"
            emoji="😌"
            variant="secondary"
            onPress={() => navigation.navigate('Calma')}
            accessibilityHint="Abre frases de comunicación rápida para momentos difíciles"
          />
        </View>
        <View style={styles.gridItem}>
          <BigButton
            label="Mi Día"
            emoji="📅"
            variant="secondary"
            onPress={() => navigation.navigate('MiDia')}
            accessibilityHint="Abre la agenda visual de rutinas"
          />
        </View>
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

      <Text style={styles.comingSoonNote}>Sensorial y Juega & Regula llegan en próximas fases.</Text>

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
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  gridItem: {
    flex: 1,
  },
  helpAction: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  comingSoonNote: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
