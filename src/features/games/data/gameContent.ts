import { colors } from '@shared/theme';

export interface ColorItem {
  id: string;
  label: string;
  value: string;
}

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond';

export interface ShapeItem {
  id: ShapeKind;
  label: string;
}

export interface EmotionItem {
  id: string;
  label: string;
  emoji: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  emoji: string;
  categoryId: string;
}

export interface GameCategory {
  id: string;
  label: string;
  emoji: string;
}

/**
 * Colores del juego de emparejar. Se eligen bien separados en tono para
 * que la diferencia no dependa de matices finos, y la consigna incluye
 * siempre el nombre además del color.
 */
export const GAME_COLORS: ColorItem[] = [
  { id: 'red', label: 'rojo', value: '#E06C6C' },
  { id: 'blue', label: 'azul', value: '#6C8CE0' },
  { id: 'yellow', label: 'amarillo', value: '#E8C86D' },
  { id: 'green', label: 'verde', value: '#7FBF8F' },
  { id: 'orange', label: 'naranja', value: '#E8A06D' },
  { id: 'purple', label: 'morado', value: '#B9A7E0' },
];

export const GAME_SHAPES: ShapeItem[] = [
  { id: 'circle', label: 'círculo' },
  { id: 'square', label: 'cuadrado' },
  { id: 'triangle', label: 'triángulo' },
  { id: 'star', label: 'estrella' },
  { id: 'heart', label: 'corazón' },
  { id: 'diamond', label: 'rombo' },
];

export const GAME_EMOTIONS: EmotionItem[] = [
  { id: 'happy', label: 'feliz', emoji: '😊' },
  { id: 'sad', label: 'triste', emoji: '😢' },
  { id: 'angry', label: 'enojado', emoji: '😡' },
  { id: 'scared', label: 'asustado', emoji: '😨' },
  { id: 'tired', label: 'cansado', emoji: '😴' },
  { id: 'calm', label: 'tranquilo', emoji: '😌' },
];

export const GAME_CATEGORIES: GameCategory[] = [
  { id: 'animals', label: 'Animales', emoji: '🐶' },
  { id: 'food', label: 'Comida', emoji: '🍎' },
  { id: 'clothing', label: 'Ropa', emoji: '👕' },
  { id: 'toys', label: 'Juguetes', emoji: '🧸' },
];

export const GAME_CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'dog', label: 'Perro', emoji: '🐶', categoryId: 'animals' },
  { id: 'cat', label: 'Gato', emoji: '🐱', categoryId: 'animals' },
  { id: 'bird', label: 'Pájaro', emoji: '🐦', categoryId: 'animals' },
  { id: 'fish', label: 'Pez', emoji: '🐟', categoryId: 'animals' },
  { id: 'apple', label: 'Manzana', emoji: '🍎', categoryId: 'food' },
  { id: 'bread', label: 'Pan', emoji: '🍞', categoryId: 'food' },
  { id: 'banana', label: 'Banana', emoji: '🍌', categoryId: 'food' },
  { id: 'milk', label: 'Leche', emoji: '🥛', categoryId: 'food' },
  { id: 'shirt', label: 'Remera', emoji: '👕', categoryId: 'clothing' },
  { id: 'pants', label: 'Pantalón', emoji: '👖', categoryId: 'clothing' },
  { id: 'shoes', label: 'Zapatos', emoji: '👟', categoryId: 'clothing' },
  { id: 'hat', label: 'Gorro', emoji: '🧢', categoryId: 'clothing' },
  { id: 'ball', label: 'Pelota', emoji: '⚽', categoryId: 'toys' },
  { id: 'teddy', label: 'Oso', emoji: '🧸', categoryId: 'toys' },
  { id: 'blocks', label: 'Bloques', emoji: '🧱', categoryId: 'toys' },
  { id: 'car', label: 'Auto', emoji: '🚗', categoryId: 'toys' },
];

/** Colores de las cartas del juego de memoria y de la secuencia. */
export const GAME_TILE_COLORS: string[] = [
  colors.accent,
  colors.primary,
  colors.lavender,
  colors.blush,
  colors.warning,
  colors.success,
];

/** Baraja el arreglo sin mutarlo (Fisher-Yates). */
export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/** Elige `count` elementos distintos al azar. */
export function pickRandom<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}
