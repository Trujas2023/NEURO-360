import { Image, StyleSheet, Text, View } from 'react-native';

import { radius } from '@shared/theme';

export interface AacCardVisualProps {
  emoji: string;
  imageUri?: string;
  size?: number;
}

/** Foto personalizada si existe; si no, el pictograma (emoji) de la tarjeta. */
export function AacCardVisual({ emoji, imageUri, size = 64 }: AacCardVisualProps) {
  const dimensionStyle = { width: size, height: size };

  if (imageUri) {
    return <Image source={{ uri: imageUri }} style={[styles.image, dimensionStyle]} />;
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
