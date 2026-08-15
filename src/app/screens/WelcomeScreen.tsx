import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ScreenContainer } from '@shared/components';
import { APP_NAME } from '@shared/constants/app';
import { colors, radius, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

/**
 * Primera pantalla de la app (Fase 7D). Antes era un solo emoji dentro de
 * un círculo blanco, sin ninguna identidad de marca (ver
 * `docs/V7_PRODUCT_AUDIT.md` §1/§9). No hay ilustración ni tipografía
 * personalizada bundleadas todavía (`assets/fonts` e `images` siguen
 * vacíos — los únicos PNG del repo son el ícono/splash por defecto de la
 * plantilla de Expo, no una marca real, así que tampoco eran usables
 * acá). En su lugar: una insignia de dos capas con un ícono vectorial y
 * una composición tipográfica de dos líneas con jerarquía real, con los
 * tokens del Design System — sin depender de ningún asset nuevo.
 */
export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer centered>
      <View style={styles.badgeOuter}>
        <View style={styles.badgeInner}>
          <Ionicons name="planet" size={48} color={colors.textPrimary} />
        </View>
      </View>

      <View accessible accessibilityLabel={APP_NAME}>
        <Text style={styles.titlePrimary}>Sense & Play</Text>
        <Text style={styles.titleSecondary}>ADVENTURES 360</Text>
      </View>

      <Text style={styles.tagline}>Comunicación y juego sensorial, a tu ritmo.</Text>
      <View style={styles.action}>
        <BigButton label="Comenzar" emoji="➡️" onPress={() => navigation.navigate('ProfileSelector')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badgeOuter: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badgeInner: {
    width: 92,
    height: 92,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePrimary: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleSecondary: {
    marginTop: 2,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    // No colors.primaryDark: contrast 2.97:1 sobre el fondo, por debajo
    // incluso del piso de 3:1 de texto grande (medido, no supuesto).
    color: colors.textSecondary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  tagline: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
