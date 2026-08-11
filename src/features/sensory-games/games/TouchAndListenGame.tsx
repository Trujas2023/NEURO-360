import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@shared/theme';

import { TOUCH_AND_LISTEN_SOUNDS, type TouchAndListenSound } from '../constants/touchAndListenSounds';

export interface TouchAndListenGameProps {
  enabledIds: Set<string>;
  onPlay: (sound: TouchAndListenSound) => void;
}

/** Botones grandes de causa-efecto: tocar reproduce un sonido corto. */
export function TouchAndListenGame({ enabledIds, onPlay }: TouchAndListenGameProps) {
  const visibleSounds = TOUCH_AND_LISTEN_SOUNDS.filter((sound) => enabledIds.has(sound.id));

  return (
    <View style={styles.grid}>
      {visibleSounds.map((sound) => (
        <Pressable
          key={sound.id}
          onPress={() => onPlay(sound)}
          accessibilityRole="button"
          accessibilityLabel={sound.label}
          style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.75 : 1 }]}
        >
          <Text style={styles.emoji}>{sound.emoji}</Text>
          <Text style={styles.label}>{sound.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  tile: {
    width: 130,
    minHeight: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 44,
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
