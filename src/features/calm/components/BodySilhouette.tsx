import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import type { BodyRegion } from '../data/painVocabulary';

export interface BodySilhouetteProps {
  selectedRegion?: BodyRegion | null;
  onSelectRegion: (region: BodyRegion) => void;
}

interface RegionShape {
  region: BodyRegion;
  label: string;
  style: ViewStyle;
  /** Copia espejada (brazo/mano/pierna/pie izquierdo y derecho son la misma parte). */
  mirrored?: ViewStyle;
}

/**
 * Silueta corporal simple, construida con Views (sin dependencias de SVG
 * ni de dibujo): apoya a quien todavía no lee, que puede señalar dónde le
 * duele en vez de buscar la palabra. Es un atajo, no el único camino: la
 * grilla de partes sigue debajo y cubre también las que no son
 * distinguibles en una silueta chica (oído, boca, dientes).
 */
const SHAPES: RegionShape[] = [
  { region: 'head', label: 'Cabeza', style: { top: 0, left: 49, width: 52, height: 52, borderRadius: 26 } },
  { region: 'throat', label: 'Garganta', style: { top: 53, left: 65, width: 20, height: 14 } },
  { region: 'belly', label: 'Barriga', style: { top: 68, left: 40, width: 70, height: 86, borderRadius: 16 } },
  {
    region: 'arm',
    label: 'Brazo',
    style: { top: 74, left: 16, width: 20, height: 74, borderRadius: 10 },
    mirrored: { top: 74, left: 114, width: 20, height: 74, borderRadius: 10 },
  },
  {
    region: 'hand',
    label: 'Mano',
    style: { top: 152, left: 14, width: 24, height: 24, borderRadius: 12 },
    mirrored: { top: 152, left: 112, width: 24, height: 24, borderRadius: 12 },
  },
  {
    region: 'leg',
    label: 'Pierna',
    style: { top: 158, left: 46, width: 26, height: 82, borderRadius: 12 },
    mirrored: { top: 158, left: 78, width: 26, height: 82, borderRadius: 12 },
  },
  {
    region: 'foot',
    label: 'Pie',
    style: { top: 242, left: 42, width: 30, height: 18, borderRadius: 8 },
    mirrored: { top: 242, left: 78, width: 30, height: 18, borderRadius: 8 },
  },
];

export function BodySilhouette({ selectedRegion, onSelectRegion }: BodySilhouetteProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.canvas}>
        {SHAPES.map((shape) => {
          const selected = shape.region === selectedRegion;
          const fill = selected ? colors.danger : colors.secondary;

          return (
            <View key={shape.region}>
              <Pressable
                onPress={() => onSelectRegion(shape.region)}
                accessibilityRole="button"
                accessibilityLabel={shape.label}
                accessibilityState={{ selected }}
                style={[styles.region, shape.style, { backgroundColor: fill }]}
              />
              {shape.mirrored ? (
                <Pressable
                  onPress={() => onSelectRegion(shape.region)}
                  accessible={false}
                  importantForAccessibility="no"
                  style={[styles.region, shape.mirrored, { backgroundColor: fill }]}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <Text style={styles.hint}>Toca dónde te duele, o elígelo abajo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  canvas: {
    width: 150,
    height: 262,
  },
  region: {
    position: 'absolute',
    borderRadius: radius.sm,
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
