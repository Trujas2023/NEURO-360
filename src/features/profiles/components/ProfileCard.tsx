import { Pressable, StyleSheet, Text } from 'react-native';

import { ProfileAvatar } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';
import type { ChildProfile } from '@shared/types';

export interface ProfileCardProps {
  profile: ChildProfile;
  onPress: () => void;
}

/** Tarjeta grande y pulsable para elegir un perfil infantil. */
export function ProfileCard({ profile, onPress }: ProfileCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Entrar como ${profile.name}`}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
    >
      <ProfileAvatar
        name={profile.name}
        avatarUri={profile.avatarUri}
        avatarColor={profile.avatarColor}
        size={72}
      />
      <Text style={styles.name}>{profile.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minWidth: 140,
    minHeight: 140,
    justifyContent: 'center',
  },
  name: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
