import { createId } from '@shared/utils/id';

import { getCategory } from './categories';
import type { AacCard } from '../types';

interface SeedDefinition {
  categoryId: string;
  label: string;
  emoji: string;
}

/**
 * Vocabulario inicial por defecto. Cubre los ejemplos de la Fase 3
 * (Agua, Comer, Baño, Ayuda, Sí, No, Más, Terminé, Quiero descansar, Me
 * duele, Estoy feliz/triste/enojado, Tengo miedo) y la sección de
 * emociones/necesidades de expresión rápida (uno o dos toques).
 */
const SEED_DEFINITIONS: SeedDefinition[] = [
  // Comida
  { categoryId: 'food', label: 'Comer', emoji: '🍽️' },
  { categoryId: 'food', label: 'Manzana', emoji: '🍎' },
  { categoryId: 'food', label: 'Pan', emoji: '🍞' },
  { categoryId: 'food', label: 'Más comida', emoji: '➕' },
  // Bebidas
  { categoryId: 'drinks', label: 'Agua', emoji: '💧' },
  { categoryId: 'drinks', label: 'Leche', emoji: '🥛' },
  { categoryId: 'drinks', label: 'Jugo', emoji: '🧃' },
  // Quiero
  { categoryId: 'want', label: 'Quiero', emoji: '❤️' },
  { categoryId: 'want', label: 'Yo', emoji: '🙋' },
  { categoryId: 'want', label: 'Sí', emoji: '✅' },
  { categoryId: 'want', label: 'Más', emoji: '➕' },
  // No quiero
  { categoryId: 'dontWant', label: 'No quiero', emoji: '🚫' },
  { categoryId: 'dontWant', label: 'No', emoji: '❌' },
  { categoryId: 'dontWant', label: 'Terminé', emoji: '🏁' },
  { categoryId: 'dontWant', label: 'Quiero parar', emoji: '🛑' },
  // Emociones
  { categoryId: 'emotions', label: 'Estoy feliz', emoji: '😊' },
  { categoryId: 'emotions', label: 'Estoy triste', emoji: '😢' },
  { categoryId: 'emotions', label: 'Estoy enojado', emoji: '😡' },
  { categoryId: 'emotions', label: 'Tengo miedo', emoji: '😨' },
  { categoryId: 'emotions', label: 'Estoy cansado', emoji: '😴' },
  // Me duele
  { categoryId: 'hurts', label: 'Me duele', emoji: '🤕' },
  { categoryId: 'hurts', label: 'Me duele la cabeza', emoji: '🤕' },
  { categoryId: 'hurts', label: 'Me duele la panza', emoji: '🤕' },
  // Baño
  { categoryId: 'bathroom', label: 'Baño', emoji: '🚽' },
  { categoryId: 'bathroom', label: 'Necesito ir al baño', emoji: '🚽' },
  { categoryId: 'bathroom', label: 'Lavarme las manos', emoji: '🧼' },
  // Lugares
  { categoryId: 'places', label: 'Casa', emoji: '🏠' },
  { categoryId: 'places', label: 'Quiero ir a casa', emoji: '🏠' },
  { categoryId: 'places', label: 'Quiero irme', emoji: '🚪' },
  { categoryId: 'places', label: 'Escuela', emoji: '🏫' },
  // Personas
  { categoryId: 'people', label: 'Mamá', emoji: '👩' },
  { categoryId: 'people', label: 'Papá', emoji: '👨' },
  { categoryId: 'people', label: 'Familia', emoji: '👨‍👩‍👧' },
  { categoryId: 'people', label: 'Amigo', emoji: '🧑‍🤝‍🧑' },
  // Actividades
  { categoryId: 'activities', label: 'Jugar', emoji: '🎮' },
  { categoryId: 'activities', label: 'Ver tele', emoji: '📺' },
  { categoryId: 'activities', label: 'Leer', emoji: '📖' },
  { categoryId: 'activities', label: 'Música', emoji: '🎵' },
  // Necesidades
  { categoryId: 'needs', label: 'Quiero descansar', emoji: '🛏️' },
  { categoryId: 'needs', label: 'Tengo sueño', emoji: '😴' },
  { categoryId: 'needs', label: 'Hay mucho ruido', emoji: '🔊' },
  { categoryId: 'needs', label: 'Necesito silencio', emoji: '🤫' },
  // Ayuda
  { categoryId: 'help', label: 'Ayuda', emoji: '🆘' },
  { categoryId: 'help', label: 'Necesito ayuda', emoji: '🫂' },
  { categoryId: 'help', label: 'Ven aquí', emoji: '👋' },
];

/** Genera el vocabulario inicial de un perfil nuevo (una sola vez, ver `useAacCards`). */
export function buildDefaultCards(): AacCard[] {
  const orderByCategory = new Map<string, number>();

  return SEED_DEFINITIONS.map((definition) => {
    const order = orderByCategory.get(definition.categoryId) ?? 0;
    orderByCategory.set(definition.categoryId, order + 1);

    return {
      id: createId(),
      categoryId: definition.categoryId,
      label: definition.label,
      emoji: definition.emoji,
      color: getCategory(definition.categoryId)?.color ?? '#CCCCCC',
      isFavorite: false,
      order,
      createdAt: new Date().toISOString(),
    };
  });
}
