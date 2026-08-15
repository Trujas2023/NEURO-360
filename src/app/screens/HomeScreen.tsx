import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { AppIcon, ChildModeShell, ProfileAvatar } from '@shared/components';
import { colors, hairline, minTouchTarget, radius, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface Pillar {
  key: string;
  title: string;
  emoji: string;
  /** R2-R10 todavía no construida: se muestra para que la navegación/arquitectura sea completa, pero nunca se cuenta como terminada (ver docs/PRODUCT_MASTER_SPEC.md §0, requisito 10 de R1). */
  pending?: boolean;
  onPress: () => void;
  accessibilityHint?: string;
}

/**
 * Pantalla principal de Modo Niño: los 4 pilares del producto con igual
 * jerarquía visual (R1, ver docs/PRODUCT_MASTER_SPEC.md §1.2) — reemplaza
 * la lista vertical de 3 botones de peso desigual que tenía antes. "Mundo
 * Sensorial" queda marcado como pendiente (R3) tanto visualmente (insignia
 * "Construyendo") como en accesibilidad (la etiqueta lo anuncia), y no
 * cuenta como funcionalidad terminada de R1.
 */
export function HomeScreen({ navigation }: Props) {
  const { activeProfile } = useProfiles();

  useEffect(() => {
    if (!activeProfile) {
      navigation.replace('ProfileSelector');
    }
  }, [activeProfile, navigation]);

  if (!activeProfile) {
    return null;
  }

  const pillars: Pillar[] = [
    {
      key: 'aac',
      title: 'Mi Voz',
      emoji: '🗣️',
      onPress: () => navigation.navigate('AacCommunicator'),
      accessibilityHint: 'Abre el comunicador de tarjetas',
    },
    {
      key: 'sensory',
      title: 'Mundo Sensorial',
      emoji: '🎮',
      pending: true,
      onPress: () => navigation.navigate('ComingSoon', { title: 'Mundo Sensorial', emoji: '🎮' }),
    },
    {
      key: 'day',
      title: 'Mi Día',
      emoji: '🗓️',
      onPress: () => navigation.navigate('MyDay'),
      accessibilityHint: 'Abre la agenda visual de rutinas',
    },
    {
      key: 'calm',
      title: 'Calma',
      emoji: '😌',
      onPress: () => navigation.navigate('AacCommunicator', { screen: 'AacCalm' }),
      accessibilityHint: 'Frases de comunicación rápida para momentos difíciles',
    },
  ];

  return (
    <ChildModeShell scrollable>
      <View style={styles.profileRow}>
        <View style={styles.profileInfo}>
          <ProfileAvatar
            name={activeProfile.name}
            avatarUri={activeProfile.avatarUri}
            avatarColor={activeProfile.avatarColor}
            size={56}
          />
          <Text style={styles.profileName}>{activeProfile.name}</Text>
        </View>
        <View style={styles.headerIcons}>
          <Pressable
            onPress={() => navigation.navigate('PinGate')}
            accessibilityRole="button"
            accessibilityLabel="Centro de Adultos"
            accessibilityHint="Pide un PIN para entrar a la configuración"
            style={({ pressed }) => [styles.adultAccessButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <AppIcon name="lock-closed-outline" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('ProfileSelector')}
            accessibilityRole="button"
            accessibilityLabel="Cambiar de perfil"
            style={({ pressed }) => [styles.changeProfileButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <AppIcon name="settings-outline" size={26} />
          </Pressable>
        </View>
      </View>

      <View style={styles.grid}>
        {pillars.map((pillar) => (
          <Pressable
            key={pillar.key}
            onPress={pillar.onPress}
            accessibilityRole="button"
            accessibilityLabel={
              pillar.pending ? `${pillar.title}, todavía en construcción` : pillar.title
            }
            accessibilityHint={pillar.accessibilityHint}
            style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.85 : 1 }]}
          >
            {pillar.pending ? (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Construyendo</Text>
              </View>
            ) : null}
            <Text style={styles.tileEmoji}>{pillar.emoji}</Text>
            <Text style={styles.tileTitle}>{pillar.title}</Text>
          </Pressable>
        ))}
      </View>
    </ChildModeShell>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    marginLeft: spacing.md,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  /**
   * Acceso diferenciado al Centro de Adultos (R1, requisito 3): mismo
   * área táctil mínima que cualquier otro control, pero visualmente
   * discreto (ícono pequeño, color atenuado, sin fondo) a propósito — no
   * debe competir con los 4 pilares ni parecer un acceso pensado para el
   * niño. Sigue protegido por PIN (`PinGateScreen`), sin cambios.
   */
  adultAccessButton: {
    width: minTouchTarget,
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeProfileButton: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.border,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: 150,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  tileEmoji: {
    fontSize: 44,
    marginBottom: spacing.xs,
  },
  tileTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pendingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.warning,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pendingBadgeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilyBold,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
