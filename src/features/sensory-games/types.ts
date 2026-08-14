/** Tipos de dominio de "Juega & Regula": catálogo de minijuegos sensoriales. */

import type { SensoryGamesStackParamList } from './navigation/types';

export interface SensoryGameInfo {
  id: string;
  title: string;
  emoji: string;
  color: string;
  /** Ruta dentro de `SensoryGamesNavigator`; ausente si el juego todavía no está implementado (lleva a `ComingSoon`). */
  route?: keyof SensoryGamesStackParamList;
}
