import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { DEFAULT_PROFILE_PREFERENCES } from '@shared/constants/profiles';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';
import type { ChildProfilePreferences } from '@shared/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Accessibility'>;

/**
 * Accesibilidad (Fase 7H): lugar único para lo que hoy vive repartido en
 * `ProfileFormScreen` (sonido/movimiento, mezclado con nombre y foto) y en
 * `AacSettingsScreen` (tamaño de texto y qué mostrar en tarjeta, propio de
 * Mi Voz). Los dos toggles de acá **son** la fuente de verdad — cambiarlos
 * acá o en `ProfileFormScreen` hace exactamente lo mismo, mismo campo de
 * `ChildProfilePreferences`. Tamaño de texto y "qué mostrar" no se
 * duplican: se enlaza a `AacSettings`, donde ya viven, para no tener dos
 * lugares que puedan desincronizarse.
 *
 * Contraste (alto contraste / paleta alternativa) queda fuera de esta
 * fase a propósito: hoy no existe ninguna paleta alternativa definida en
 * el Design System (Fase 7C) — agregar un toggle sin nada real detrás de
 * él sería el mismo defecto que `ComingSoonScreen` (ver
 * `docs/V7_PRODUCT_AUDIT.md` §5). Requiere una decisión de Design System
 * antes de poder construirse.
 */
export function AccessibilityScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles, updateProfile } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);

  if (!profile) {
    return (
      <ScreenContainer centered>
        <Text style={styles.empty}>No se encontró el perfil.</Text>
        <BigButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const prefs: ChildProfilePreferences = { ...DEFAULT_PROFILE_PREFERENCES, ...profile.preferences };

  function setPref<K extends keyof ChildProfilePreferences>(key: K, value: ChildProfilePreferences[K]) {
    updateProfile(profileId, { preferences: { ...prefs, [key]: value } });
  }

  return (
    <ScreenContainer scrollable>
      <Text style={styles.title}>♿ Accesibilidad</Text>
      <Text style={styles.subtitle}>{profile.name}</Text>

      <Section title="General">
        <ToggleRow
          label="Sonido activado"
          hint="Apaga TTS y efectos de sonido en toda la app."
          value={prefs.soundEnabled}
          onValueChange={(value) => setPref('soundEnabled', value)}
        />
        <ToggleRow
          label="Reducir movimiento"
          hint="Ralentiza animaciones en Mundo Sensorial, Mi Día y Calma. Ninguna actividad desaparece, solo va más lento."
          value={prefs.reduceMotion}
          onValueChange={(value) => setPref('reduceMotion', value)}
        />
      </Section>

      <Section title="Mi Voz">
        <Text style={styles.linkHint}>
          Tamaño de texto y qué mostrar en las tarjetas (imagen, color, favoritos…) se configuran en los
          ajustes propios de Mi Voz, para no tener dos lugares con el mismo control.
        </Text>
        <BigButton
          label="Abrir ajustes de Mi Voz"
          variant="secondary"
          fullWidth={false}
          onPress={() => navigation.navigate('AacSettings', { profileId })}
        />
      </Section>

      <View style={styles.actions}>
        <BigButton label="Volver" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint ? <Text style={styles.toggleHint}>{hint}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  empty: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  toggleLabel: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  toggleHint: {
    marginTop: 2,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  linkHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
