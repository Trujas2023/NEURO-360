import { Pressable, StyleSheet, Text } from 'react-native';

import { ProfileAvatar } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';
import type { ChildProfile } from '@shared/types';

export interface ProfileCardProps {
  profile: ChildProfile;
  onPress: () => void;
  /** Marca la tarjeta como elegida (p. ej. el perfil que se está administrando en Centro Adulto). */
  selected?: boolean;
  /** Reemplaza el texto leído por accesibilidad; por defecto "Entrar como {nombre}". */
  accessibilityLabel?: string;
}

/** Tarjeta grande y pulsable para elegir un perfil infantil. */
export function ProfileCard({ profile, onPress, selected = false, accessibilityLabel }: ProfileCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Entrar como ${profile.name}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.card, selected && styles.cardSelected, { opacity: pressed ? 0.85 : 1 }]}
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
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  name: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
