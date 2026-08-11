import { createId } from '@shared/utils/id';

import { getCategory } from './categories';
import type { AacCard } from '../types';

interface SeedDefinition {
  categoryId: string;
  label: string;
  emoji: string;
}

/**
 * Vocabulario inicial por defecto (v0.2): biblioteca completa pedida para
 * "Mi Voz" — Necesidades, Comida y bebida, Emociones, Personas, Lugares,
 * Actividades, Dolor/malestar, Sí/No y Frases rápidas (categoría nueva:
 * cada frase se guarda como una tarjeta con una etiqueta de varias
 * palabras, así hablarla no requiere construirla palabra por palabra).
 * Es intencional que algunas palabras se repitan en más de una categoría
 * (p. ej. "Agua" en Necesidades y en Comida y bebida): así lo pide la
 * especificación, y cada repetición es una tarjeta independiente.
 */
const SEED_DEFINITIONS: SeedDefinition[] = [
  // Necesidades
  { categoryId: 'needs', label: 'Agua', emoji: '💧' },
  { categoryId: 'needs', label: 'Baño', emoji: '🚽' },
  { categoryId: 'needs', label: 'Comer', emoji: '🍽️' },
  { categoryId: 'needs', label: 'Descansar', emoji: '🛌' },
  { categoryId: 'needs', label: 'Ayuda', emoji: '🆘' },
  { categoryId: 'needs', label: 'Dormir', emoji: '😴' },
  { categoryId: 'needs', label: 'Más', emoji: '➕' },
  { categoryId: 'needs', label: 'Terminé', emoji: '🏁' },
  { categoryId: 'needs', label: 'Espera', emoji: '⏳' },
  { categoryId: 'needs', label: 'Quiero estar solo', emoji: '🙅' },
  // Comida y bebida
  { categoryId: 'foodDrink', label: 'Agua', emoji: '💧' },
  { categoryId: 'foodDrink', label: 'Leche', emoji: '🥛' },
  { categoryId: 'foodDrink', label: 'Jugo', emoji: '🧃' },
  { categoryId: 'foodDrink', label: 'Manzana', emoji: '🍎' },
  { categoryId: 'foodDrink', label: 'Plátano', emoji: '🍌' },
  { categoryId: 'foodDrink', label: 'Galleta', emoji: '🍪' },
  { categoryId: 'foodDrink', label: 'Yogur', emoji: '🥣' },
  { categoryId: 'foodDrink', label: 'Comida', emoji: '🍽️' },
  { categoryId: 'foodDrink', label: 'Snack', emoji: '🍿' },
  // Emociones
  { categoryId: 'emotions', label: 'Feliz', emoji: '😊' },
  { categoryId: 'emotions', label: 'Triste', emoji: '😢' },
  { categoryId: 'emotions', label: 'Enojado', emoji: '😡' },
  { categoryId: 'emotions', label: 'Asustado', emoji: '😨' },
  { categoryId: 'emotions', label: 'Cansado', emoji: '😴' },
  { categoryId: 'emotions', label: 'Nervioso', emoji: '😬' },
  { categoryId: 'emotions', label: 'Frustrado', emoji: '😤' },
  { categoryId: 'emotions', label: 'Tranquilo', emoji: '😌' },
  { categoryId: 'emotions', label: 'Me duele', emoji: '🤕' },
  // Personas (se agrega "Yo" para poder armar el ejemplo "Yo quiero agua")
  { categoryId: 'people', label: 'Yo', emoji: '🙋' },
  { categoryId: 'people', label: 'Mamá', emoji: '👩' },
  { categoryId: 'people', label: 'Papá', emoji: '👨' },
  { categoryId: 'people', label: 'Maestro/a', emoji: '🧑‍🏫' },
  { categoryId: 'people', label: 'Terapeuta', emoji: '🩺' },
  { categoryId: 'people', label: 'Hermano/a', emoji: '🧒' },
  { categoryId: 'people', label: 'Abuelo/a', emoji: '👴' },
  // Lugares
  { categoryId: 'places', label: 'Casa', emoji: '🏠' },
  { categoryId: 'places', label: 'Escuela', emoji: '🏫' },
  { categoryId: 'places', label: 'Baño', emoji: '🚽' },
  { categoryId: 'places', label: 'Parque', emoji: '🌳' },
  { categoryId: 'places', label: 'Carro', emoji: '🚗' },
  { categoryId: 'places', label: 'Terapia', emoji: '🩺' },
  // Actividades
  { categoryId: 'activities', label: 'Jugar', emoji: '🎮' },
  { categoryId: 'activities', label: 'Dormir', emoji: '😴' },
  { categoryId: 'activities', label: 'Comer', emoji: '🍽️' },
  { categoryId: 'activities', label: 'Ver televisión', emoji: '📺' },
  { categoryId: 'activities', label: 'Tablet', emoji: '📱' },
  { categoryId: 'activities', label: 'Salir', emoji: '🚶' },
  { categoryId: 'activities', label: 'Colorear', emoji: '🎨' },
  { categoryId: 'activities', label: 'Música', emoji: '🎵' },
  // Dolor / malestar
  { categoryId: 'hurts', label: 'Me duele', emoji: '🤕' },
  { categoryId: 'hurts', label: 'Cabeza', emoji: '🤕' },
  { categoryId: 'hurts', label: 'Garganta', emoji: '😷' },
  { categoryId: 'hurts', label: 'Estómago', emoji: '🤢' },
  { categoryId: 'hurts', label: 'Dientes', emoji: '🦷' },
  { categoryId: 'hurts', label: 'Oído', emoji: '👂' },
  { categoryId: 'hurts', label: 'Mano', emoji: '✋' },
  { categoryId: 'hurts', label: 'Pie', emoji: '🦶' },
  { categoryId: 'hurts', label: 'Tengo frío', emoji: '🥶' },
  { categoryId: 'hurts', label: 'Tengo calor', emoji: '🥵' },
  // Sí / No
  { categoryId: 'yesNo', label: 'Sí', emoji: '✅' },
  { categoryId: 'yesNo', label: 'No', emoji: '❌' },
  { categoryId: 'yesNo', label: 'No quiero', emoji: '🚫' },
  { categoryId: 'yesNo', label: 'Quiero', emoji: '❤️' },
  { categoryId: 'yesNo', label: 'Otra vez', emoji: '🔁' },
  { categoryId: 'yesNo', label: 'Ya terminé', emoji: '🏁' },
  // Frases rápidas: cada una habla la frase completa en un solo toque.
  { categoryId: 'quickPhrases', label: 'Tengo hambre', emoji: '🍽️' },
  { categoryId: 'quickPhrases', label: 'Tengo sed', emoji: '🥤' },
  { categoryId: 'quickPhrases', label: 'Quiero ir al baño', emoji: '🚽' },
  { categoryId: 'quickPhrases', label: 'Necesito ayuda', emoji: '🆘' },
  { categoryId: 'quickPhrases', label: 'Quiero descansar', emoji: '🛌' },
  { categoryId: 'quickPhrases', label: 'No quiero', emoji: '🚫' },
  { categoryId: 'quickPhrases', label: 'Me duele', emoji: '🤕' },
  { categoryId: 'quickPhrases', label: 'Quiero ir a casa', emoji: '🏠' },
  { categoryId: 'quickPhrases', label: 'Quiero jugar', emoji: '🎮' },
  { categoryId: 'quickPhrases', label: 'Necesito espacio', emoji: '🧘' },
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
      useCount: 0,
    };
  });
}
