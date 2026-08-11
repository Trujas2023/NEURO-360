import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@shared/theme';

export interface ProfileAvatarProps {
  name: string;
  avatarUri?: string;
  avatarColor: string;
  size?: number;
}

/**
 * Foto del perfil si existe; si no, un círculo de color con la inicial del
 * nombre. Si la foto falla al cargar, se cae a la inicial en vez de
 * mostrar un ícono roto (Módulo 15).
 */
export function ProfileAvatar({ name, avatarUri, avatarColor, size = 96 }: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  // Reinicia el estado de error cuando cambia la foto, sin useEffect: es el
  // patrón que React recomienda para "ajustar estado ante un cambio de prop".
  const [trackedUri, setTrackedUri] = useState(avatarUri);
  if (avatarUri !== trackedUri) {
    setTrackedUri(avatarUri);
    setFailed(false);
  }

  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (avatarUri && !failed) {
    return (
      <Image
        source={{ uri: avatarUri }}
        style={[styles.image, dimensionStyle]}
        accessibilityLabel={`Foto de ${name}`}
        onError={() => setFailed(true)}
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
    color: colors.onPrimary,
    fontWeight: '700',
  },
});
