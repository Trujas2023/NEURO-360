import { getItem, removeItem, setItem } from '@services/storage/asyncStorage';
import { registerProfileDataCleanup } from '@services/storage/profileDataRegistry';

import type { GameId } from '../types';

export interface GameStatsEntry {
  sessionsCompleted: number;
  lastPlayedAt: string;
}

/** Una entrada por juego que se llegó a completar al menos una vez; los que no se jugaron no aparecen. */
export type GameStats = Partial<Record<GameId, GameStatsEntry>>;

function statsKey(profileId: string): string {
  return `sense-play/games/stats/${profileId}`;
}

export async function getGameStats(profileId: string): Promise<GameStats> {
  return (await getItem<GameStats>(statsKey(profileId))) ?? {};
}

/** Sobrescribe todas las estadísticas del perfil de una vez (usado al restaurar un respaldo). */
export async function saveGameStats(profileId: string, stats: GameStats): Promise<void> {
  await setItem(statsKey(profileId), stats);
}

/** Suma una partida completada del juego indicado (Fase 7I, para Estadísticas). */
export async function recordGameSession(profileId: string, gameId: GameId): Promise<void> {
  const stats = await getGameStats(profileId);
  const previous = stats[gameId];
  const next: GameStats = {
    ...stats,
    [gameId]: {
      sessionsCompleted: (previous?.sessionsCompleted ?? 0) + 1,
      lastPlayedAt: new Date().toISOString(),
    },
  };
  await setItem(statsKey(profileId), next);
}

export async function removeGameStats(profileId: string): Promise<void> {
  await removeItem(statsKey(profileId));
}

// Borra las estadísticas de juegos del perfil cuando `ProfilesContext`
// elimina ese perfil, para no dejar datos huérfanos en AsyncStorage.
registerProfileDataCleanup(removeGameStats);
