import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { BigButton, ScreenContainer } from '@shared/components';
import { APP_NAME } from '@shared/constants/app';
import { colors, radius, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer centered>
      <View style={styles.logo}>
        <Text style={styles.logoEmoji}>🌈</Text>
      </View>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.tagline}>Comunicación y juego sensorial, a tu ritmo.</Text>
      <View style={styles.action}>
        <BigButton label="Comenzar" emoji="➡️" onPress={() => navigation.navigate('ProfileSelector')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 56,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
