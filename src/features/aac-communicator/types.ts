/**
 * Tipos de dominio del comunicador AAC "Mi Voz". Son locales a este
 * feature (no a `shared/types`) porque solo se usan aquí y en la
 * administración de tarjetas de Modo Adulto, que es parte del mismo
 * dominio.
 */

export interface AacCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export interface AacCard {
  id: string;
  categoryId: string;
  /** Palabra o frase corta que se lee en voz alta y se agrega a la barra de frase. */
  label: string;
  /** Pictograma simple (emoji) usado cuando la tarjeta no tiene foto. */
  emoji: string;
  /** Foto elegida por un adulto (expo-image-picker). Si existe, reemplaza al emoji. */
  imageUri?: string;
  /**
   * Grabación de voz de un adulto (reservado para cuando se agregue
   * grabación de audio). Si existe, se reproduce en vez del TTS.
   * No implementado todavía: ver docs/AAC_PRO_FASE2_PLAN.md.
   */
  audioUri?: string;
  color: string;
  isFavorite: boolean;
  /** Orden dentro de su categoría; menor va primero. */
  order: number;
  /**
   * Cuántas veces se tocó la tarjeta. Opcional para no romper tarjetas
   * guardadas antes de esta fase; se lee como `card.usageCount ?? 0`.
   */
  usageCount?: number;
  /** Fecha ISO del último toque; usada por la categoría virtual "Recientes". */
  lastUsedAt?: string;
  /**
   * Si es `false`, la tarjeta no aparece en el comunicador de Modo Niño
   * (pero se conserva para reactivarla). Opcional por compatibilidad con
   * tarjetas guardadas antes de esta fase; se lee como `card.active ?? true`.
   */
  active?: boolean;
  createdAt: string;
}

export type CreateAacCardInput = {
  categoryId: string;
  label: string;
  emoji: string;
  imageUri?: string;
  color: string;
  isFavorite?: boolean;
};

export type UpdateAacCardInput = Partial<Omit<AacCard, 'id' | 'createdAt'>>;

/**
 * Palabra de vocabulario núcleo: siempre visible, no vive en el
 * repositorio de tarjetas por perfil (no se crea/edita/elimina desde la
 * UI todavía). Definida como estructura de datos en `data/coreVocabulary.ts`
 * para poder crecer sin tocar componentes.
 */
export interface CoreWord {
  id: string;
  label: string;
  /** Texto que se lee en voz alta; por defecto igual a `label`. */
  spokenText?: string;
  emoji: string;
  color: string;
}
