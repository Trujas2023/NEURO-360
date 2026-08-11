import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { radius } from '@shared/theme';

export interface AacCardVisualProps {
  emoji: string;
  imageUri?: string;
  size?: number;
}

/**
 * Foto personalizada si existe; si no, el pictograma (emoji) de la
 * tarjeta. Si la foto falla al cargar (archivo movido/dañado), se cae al
 * pictograma en vez de mostrar un ícono roto (Módulo 15).
 */
export function AacCardVisual({ emoji, imageUri, size = 64 }: AacCardVisualProps) {
  const [failed, setFailed] = useState(false);
  // Reinicia el estado de error cuando cambia la foto, sin useEffect: es el
  // patrón que React recomienda para "ajustar estado ante un cambio de prop".
  const [trackedUri, setTrackedUri] = useState(imageUri);
  if (imageUri !== trackedUri) {
    setTrackedUri(imageUri);
    setFailed(false);
  }

  const dimensionStyle = { width: size, height: size };

  if (imageUri && !failed) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, dimensionStyle]}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={[styles.emojiWrap, dimensionStyle]}>
      <Text style={[styles.emoji, { fontSize: size * 0.6 }]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: radius.md,
  },
  emojiWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
