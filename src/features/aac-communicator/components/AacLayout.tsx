import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton, ScreenContainer } from '@shared/components';
import { colors, spacing, typography } from '@shared/theme';

import { PhraseBar } from './PhraseBar';

export interface AacLayoutProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

/** Encabezado + barra de frase + contenido, compartido por las pantallas del comunicador. */
export function AacLayout({ title, onBack, children }: AacLayoutProps) {
  return (
    <ScreenContainer scrollable>
      <PhraseBar />

      <View style={styles.header}>
        <View style={styles.backButton}>
          <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={onBack} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {children}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
