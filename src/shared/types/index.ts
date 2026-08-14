import type { AppMode } from '@shared/constants/app';

/**
 * Tipos compartidos de dominio. Se amplían en fases posteriores
 * (comunicador AAC en Fase 3-4, perfiles en Fase 2, juegos en Fase 6-7).
 * Se definen aquí ya para que la arquitectura de carpetas quede fijada
 * desde la Fase 1.
 */

/** Tamaño de cuadrícula del comunicador AAC: columnas x filas visibles por pantalla. */
export type AacBoardSize = '2x2' | '2x3' | '3x3' | '3x4' | '4x4';

/** Tamaño de texto de las tarjetas del comunicador AAC. */
export type AacTextSize = 'small' | 'medium' | 'large';

/**
 * Nivel de comunicación AAC del perfil (Mi Voz AAC V2). El adulto lo
 * cambia desde Ajustes; la interfaz de "Mi Voz" se adapta automáticamente
 * (ver `AacHomeScreen`):
 * - LEVEL_1: 2-4 opciones grandes, habla inmediata, sin barra de frase.
 * - LEVEL_2: 6-12 tarjetas núcleo en una sola grilla, sin categorías.
 * - LEVEL_3: vocabulario núcleo + categorías, sin buscador ni accesos rápidos.
 * - LEVEL_4: comunicador AAC completo (comportamiento histórico).
 */
export type CommunicationLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4';

export interface ChildProfilePreferences {
  /** Si está apagado, el comunicador y los juegos deben evitar sonido (Fase 3+). */
  soundEnabled: boolean;
  /** Si está activo, las pantallas deben minimizar animaciones (Fase 6+). */
  reduceMotion: boolean;
  /**
   * "Hablar al tocar" (Mi Voz AAC Pro). ON: cada tarjeta habla de
   * inmediato al tocarla. OFF: la tarjeta solo se agrega a la barra de
   * frase; se habla al pulsar "Hablar". Perfiles guardados antes de esta
   * fase no tienen este campo y se leen como `true` (comportamiento
   * anterior) vía `?? true`.
   */
  speakOnTap?: boolean;
  /** Columnas x filas de las grillas de tarjetas del comunicador. */
  boardSize?: AacBoardSize;
  /** Tamaño de texto de las tarjetas del comunicador. */
  textSize?: AacTextSize;
  /** Mostrar el texto de la tarjeta (además del pictograma/foto). */
  showCardText?: boolean;
  /** Mostrar pictograma/foto de la tarjeta. */
  showCardImage?: boolean;
  /** Mostrar el acento de color de categoría en cada tarjeta. */
  showCardColor?: boolean;
  /** Mostrar la categoría "Favoritos" en la pantalla principal. */
  showFavorites?: boolean;
  /** Mostrar la categoría "Más usados" en la pantalla principal. */
  showMostUsed?: boolean;
  /** Mostrar la barra de frase en las pantallas del comunicador. */
  showPhraseBar?: boolean;
  /** Mostrar la grilla de categorías en la pantalla principal. */
  showCategories?: boolean;
  /** Pedir confirmación antes de eliminar una tarjeta o rutina en Modo Adulto. */
  confirmBeforeDelete?: boolean;
  /** Velocidad del texto a voz (1.0 = normal). Ver `services/audio/speech.ts`. */
  ttsRate?: number;
  /** Tono del texto a voz (1.0 = normal), si el dispositivo lo admite. */
  ttsPitch?: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  /** Foto elegida por un adulto. Si falta, se muestra un avatar con inicial y avatarColor. */
  avatarUri?: string;
  avatarColor: string;
  preferences: ChildProfilePreferences;
  /** Opcional por compatibilidad con perfiles guardados antes de esta fase; se lee como `?? 'LEVEL_4'` (AAC completo, el comportamiento histórico). */
  communicationLevel?: CommunicationLevel;
  createdAt: string;
}

export type { AppMode };
