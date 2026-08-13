import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { ProfileCard } from '@features/profiles/components/ProfileCard';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSelector'>;

export function ProfileSelectorScreen({ navigation }: Props) {
  const { profiles, loading, selectProfile } = useProfiles();

  async function handleSelect(profileId: string) {
    await selectProfile(profileId);
    navigation.navigate('MainTabs');
  }

  if (loading) {
    return (
      <ScreenContainer centered>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>¿Quién va a usar la app?</Text>

      {profiles.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>👋</Text>
          <Text style={styles.emptyText}>
            Todavía no hay perfiles. Pídele a un adulto que cree el primero en Modo Adulto.
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {profiles.map((profile) => (
            <View key={profile.id} style={styles.gridItem}>
              <ProfileCard profile={profile} onPress={() => handleSelect(profile.id)} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <BigButton
          label="Modo Adulto"
          emoji="🔒"
          variant="ghost"
          fullWidth={false}
          onPress={() => navigation.navigate('PinGate')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  gridItem: {
    marginBottom: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
});
