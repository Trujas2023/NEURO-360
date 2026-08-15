import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { AacCardVisual } from '@features/aac-communicator/components/AacCardVisual';
import { useAacCards } from '@features/aac-communicator/hooks/useAacCards';
import { useProfiles } from '@features/profiles/context/ProfilesContext';
import { BigButton, ScreenContainer } from '@shared/components';
import { colors, radius, spacing, typography } from '@shared/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Statistics'>;

const LIST_LIMIT = 8;

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return 'hace un momento';
  }
  if (minutes < 60) {
    return `hace ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
}

/**
 * Estadísticas (Fase 7H), por perfil. Primera versión, limitada a propósito
 * a datos que ya se venían acumulando (`usageCount`/`lastUsedAt` de cada
 * tarjeta AAC, pensados desde su creación para esto — ver el comentario de
 * `createdByUser` en `features/aac-communicator/types.ts`).
 *
 * Rutinas completadas y partidas jugadas NO están acá: `DailyRoutine`
 * (Mi Día) y `GameSettings` (Juegos) no guardan ningún historial hoy, solo
 * estado actual (`RoutineStep.done`, que además se resetea al reiniciar
 * una rutina). Agregar esos contadores requiere un campo nuevo en el
 * modelo de datos, decisión de la Fase 7I — no se improvisa acá. Es
 * preferible una sección más chica que funciona de verdad a una completa
 * con números inventados.
 */
export function StatisticsScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);
  const { cards, loading } = useAacCards(profileId);

  const totalTaps = cards.reduce((sum, card) => sum + (card.usageCount ?? 0), 0);
  const mostUsed = [...cards]
    .filter((card) => (card.usageCount ?? 0) > 0)
    .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
    .slice(0, LIST_LIMIT);
  const recent = [...cards]
    .filter((card) => !!card.lastUsedAt)
    .sort((a, b) => new Date(b.lastUsedAt as string).getTime() - new Date(a.lastUsedAt as string).getTime())
    .slice(0, LIST_LIMIT);

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>📊 Estadísticas</Text>
      </View>
      <Text style={styles.subtitle}>{profile?.name ?? 'Perfil'} — Mi Voz</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : totalTaps === 0 ? (
        <Text style={styles.empty}>
          Todavía no hay actividad registrada. Los datos aparecen apenas el niño empiece a usar Mi Voz.
        </Text>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{cards.length}</Text>
              <Text style={styles.summaryLabel}>tarjetas</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{totalTaps}</Text>
              <Text style={styles.summaryLabel}>toques en total</Text>
            </View>
          </View>

          {mostUsed.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Más usadas</Text>
              {mostUsed.map((card) => (
                <View key={card.id} style={styles.row}>
                  <AacCardVisual emoji={card.emoji} imageUri={card.imageUri} size={36} />
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {card.label}
                  </Text>
                  <Text style={styles.rowValue}>
                    {card.usageCount} {card.usageCount === 1 ? 'toque' : 'toques'}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {recent.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Usadas recientemente</Text>
              {recent.map((card) => (
                <View key={card.id} style={styles.row}>
                  <AacCardVisual emoji={card.emoji} imageUri={card.imageUri} size={36} />
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {card.label}
                  </Text>
                  <Text style={styles.rowValue}>{relativeTime(card.lastUsedAt as string)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}

      <Text style={styles.pendingNote}>Estadísticas de Mi Día y Juegos: pendiente para una fase futura.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  empty: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  summaryNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  rowValue: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  pendingNote: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
