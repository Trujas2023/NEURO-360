import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ScreenContainer } from '@shared/components';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { colors, spacing, typography } from '@shared/theme';

import { PhraseBar } from './PhraseBar';

export interface AacLayoutProps {
  title: string;
  /** Omitir en la pantalla raíz del tab "Mi Voz" (no hay a dónde volver; se cambia de tab). */
  onBack?: () => void;
  children: ReactNode;
  /**
   * Sobrescribe el ajuste "Mostrar barra de frase" del perfil. Lo usa
   * Nivel 1 de comunicación (`AacHomeScreen`), que habla de inmediato en
   * vez de construir una frase, así que no tiene sentido mostrarla ahí
   * aunque el perfil la tenga activada.
   */
  showPhraseBar?: boolean;
}

/**
 * Encabezado + barra de frase + contenido, compartido por las pantallas
 * del comunicador. Calma ya no tiene un botón propio aquí: es uno de los
 * cuatro tabs principales de `MainTabs`, siempre a un toque de distancia
 * desde la barra inferior, sin duplicar el control en cada pantalla.
 */
export function AacLayout({ title, onBack, children, showPhraseBar: showPhraseBarOverride }: AacLayoutProps) {
  const { activeProfile } = useProfiles();
  const showPhraseBar =
    showPhraseBarOverride ?? (activeProfile?.preferences.showPhraseBar ?? DEFAULT_PROFILE_PREFERENCES.showPhraseBar);

  return (
    <ScreenContainer scrollable topInset={false}>
      {showPhraseBar ? <PhraseBar /> : null}

      <View style={styles.header}>
        {onBack ? (
          <View style={styles.backButton}>
            <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={onBack} />
          </View>
        ) : null}
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
