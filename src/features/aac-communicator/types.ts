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
  /** Palabra o frase corta que se muestra en la tarjeta y se agrega a la barra de frase. */
  label: string;
  /**
   * Texto que se lee en voz alta si es distinto del texto visible (p. ej.
   * tarjeta "Mamá" que dice "Quiero a mi mamá"). Opcional: si falta, se
   * lee `label`. Se resuelve siempre con `spokenText ?? label`.
   */
  spokenText?: string;
  /** Pictograma simple (emoji) usado cuando la tarjeta no tiene foto. */
  emoji: string;
  /** Foto elegida por un adulto (expo-image-picker). Si existe, reemplaza al emoji. */
  imageUri?: string;
  /**
   * Origen visual de la tarjeta. Opcional por compatibilidad con tarjetas
   * guardadas antes de esta fase; se deriva como
   * `imageType ?? (imageUri ? 'photo' : 'icon')` si falta.
   */
  imageType?: 'icon' | 'localAsset' | 'photo';
  /**
   * Grabación de voz de un adulto (reservado para cuando se agregue
   * grabación de audio). Si existe, se reproduce en vez del TTS.
   * No implementado todavía: ver docs/AAC_PRO_FASE2_PLAN.md.
   */
  audioUri?: string;
  /**
   * `true` si la creó un adulto desde "+ Nueva tarjeta"; `false`/ausente
   * si viene del vocabulario sembrado por defecto. Informativo (pensado
   * para una futura pantalla de estadísticas), no cambia el comportamiento.
   */
  createdByUser?: boolean;
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
  spokenText?: string;
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

/**
 * Frase de comunicación rápida: se reproduce de inmediato al tocarla, sin
 * pasar por la barra de frase (Calma, Ayuda, y el Nivel 1 del
 * comunicador). Vive acá y no en el feature que la consume porque es una
 * primitiva AAC compartida: `calm` y `help` la importan desde este
 * módulo, nunca al revés.
 */
export interface QuickPhrase {
  id: string;
  label: string;
  emoji: string;
  color: string;
  /**
   * Si existe, la tarjeta ofrece además un botón "Más" que abre un flujo
   * guiado (p. ej. "Me duele" → dónde/cuánto/cómo). El valor es un
   * identificador que interpreta la pantalla que la muestra; tocar la
   * tarjeta sigue hablando de inmediato, el flujo es opcional.
   */
  detail?: string;
}

/**
 * Frase guardada desde la barra de frase ("Guardar frase") para reusarla
 * después sin tener que reconstruirla tarjeta por tarjeta. Guarda el
 * texto hablado de cada palabra (no las tarjetas completas: el color o el
 * emoji de origen no importan para volver a escucharla).
 */
export interface SavedPhrase {
  id: string;
  words: string[];
  createdAt: string;
}
