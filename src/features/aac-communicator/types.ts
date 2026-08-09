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
  color: string;
  isFavorite: boolean;
  /** Orden dentro de su categoría; menor va primero. */
  order: number;
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
