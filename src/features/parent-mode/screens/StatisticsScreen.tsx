import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '@app/navigation/types';
import { AacCardVisual } from '@features/aac-communicator/components/AacCardVisual';
import { useAacCards } from '@features/aac-communicator/hooks/useAacCards';
import { useRoutines } from '@features/daily-routine/hooks/useRoutines';
import { GAME_LABELS } from '@features/games/types';
import { getGameStats } from '@features/games/storage/gameStatsRepository';
import type { GameStats } from '@features/games/storage/gameStatsRepository';
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
 * Estadísticas, por perfil. Mi Voz usa `usageCount`/`lastUsedAt` de cada
 * tarjeta AAC (acumulados desde su creación — ver el comentario de
 * `createdByUser` en `features/aac-communicator/types.ts`). Mi Día usa
 * `completedCount`/`lastCompletedAt` de cada rutina (Fase 7I, sumado en
 * `useRoutines.toggleStepDone` solo en la transición incompleta → completa).
 * Juegos usa `gameStatsRepository` (Fase 7I, una entrada por juego con
 * `sessionsCompleted`/`lastPlayedAt`, registrada al terminar cada partida).
 */
export function StatisticsScreen({ route, navigation }: Props) {
  const { profileId } = route.params;
  const { profiles } = useProfiles();
  const profile = profiles.find((item) => item.id === profileId);
  const { cards, loading } = useAacCards(profileId);
  const { routines, loading: routinesLoading } = useRoutines(profileId);

  const [gameStats, setGameStats] = useState<GameStats>({});
  const [gameStatsLoading, setGameStatsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setGameStatsLoading(true);
      const stats = await getGameStats(profileId);
      if (isMounted) {
        setGameStats(stats);
        setGameStatsLoading(false);
      }
    }

    run();

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const totalTaps = cards.reduce((sum, card) => sum + (card.usageCount ?? 0), 0);
  const mostUsed = [...cards]
    .filter((card) => (card.usageCount ?? 0) > 0)
    .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
    .slice(0, LIST_LIMIT);
  const recent = [...cards]
    .filter((card) => !!card.lastUsedAt)
    .sort((a, b) => new Date(b.lastUsedAt as string).getTime() - new Date(a.lastUsedAt as string).getTime())
    .slice(0, LIST_LIMIT);

  const completedRoutines = [...routines]
    .filter((routine) => (routine.completedCount ?? 0) > 0)
    .sort((a, b) => (b.completedCount ?? 0) - (a.completedCount ?? 0));

  const playedGames = (Object.keys(gameStats) as (keyof GameStats)[])
    .map((gameId) => ({ gameId, entry: gameStats[gameId]! }))
    .sort((a, b) => new Date(b.entry.lastPlayedAt).getTime() - new Date(a.entry.lastPlayedAt).getTime());

  const hasAnyData = totalTaps > 0 || completedRoutines.length > 0 || playedGames.length > 0;
  const anyLoading = loading || routinesLoading || gameStatsLoading;

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <BigButton label="Volver" variant="ghost" fullWidth={false} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>📊 Estadísticas</Text>
      </View>
      <Text style={styles.subtitle}>{profile?.name ?? 'Perfil'} — Mi Voz</Text>

      {anyLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : !hasAnyData ? (
        <Text style={styles.empty}>
          Todavía no hay actividad registrada. Los datos aparecen apenas el niño empiece a usar la app.
        </Text>
      ) : (
        <>
          {totalTaps > 0 ? (
            <>
              <Text style={styles.sectionHeading}>Mi Voz</Text>
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
          ) : null}

          {completedRoutines.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Mi Día</Text>
              <Text style={styles.sectionTitle}>Rutinas completadas</Text>
              {completedRoutines.map((routine) => (
                <View key={routine.id} style={styles.row}>
                  <Text style={styles.rowEmoji}>{routine.emoji}</Text>
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {routine.title}
                  </Text>
                  <Text style={styles.rowValue}>
                    {routine.completedCount} {routine.completedCount === 1 ? 'vez' : 'veces'}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {playedGames.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Juegos</Text>
              <Text style={styles.sectionTitle}>Partidas jugadas</Text>
              {playedGames.map(({ gameId, entry }) => (
                <View key={gameId} style={styles.row}>
                  <Text style={styles.rowEmoji}>{GAME_LABELS[gameId].emoji}</Text>
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {GAME_LABELS[gameId].label}
                  </Text>
                  <Text style={styles.rowValue}>
                    {entry.sessionsCompleted} {entry.sessionsCompleted === 1 ? 'partida' : 'partidas'}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}
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
  sectionHeading: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  rowEmoji: {
    fontSize: 24,
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
});
