import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@shared/theme';

export interface ProfileAvatarProps {
  name: string;
  avatarUri?: string;
  avatarColor: string;
  size?: number;
}

/** Foto del perfil si existe; si no, un círculo de color con la inicial del nombre. */
export function ProfileAvatar({ name, avatarUri, avatarColor, size = 96 }: ProfileAvatarProps) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        style={[styles.image, dimensionStyle]}
        accessibilityLabel={`Foto de ${name}`}
      />
    );
  }

  return (
    <View
      style={[styles.fallback, dimensionStyle, { backgroundColor: avatarColor }]}
      accessible
      accessibilityLabel={`Avatar de ${name}`}
    >
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.border,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    // Texto oscuro: los 6 colores de avatar son pasteles claros, ninguno
    // llega a contraste WCAG AA con texto blanco encima.
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
