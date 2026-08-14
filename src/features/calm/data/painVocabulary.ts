import { colors } from '@shared/theme';

/**
 * Parte del cuerpo del flujo "Me duele". `phrase` incluye el artículo ya
 * conjugado ("la cabeza", "el oído") y `plural` decide el verbo, para que
 * la frase final salga bien escrita en español sin reglas gramaticales
 * repartidas por la UI: "Me duele la cabeza" vs. "Me duelen los dientes".
 */
export interface PainLocation {
  id: string;
  label: string;
  emoji: string;
  color: string;
  /** Fragmento con artículo, tal como entra en la oración. */
  phrase: string;
  plural?: boolean;
  /**
   * Región equivalente en la silueta corporal, cuando existe. Las partes
   * finas de la cabeza (oído, boca, dientes) no son distinguibles en una
   * silueta pequeña y solo se eligen desde la grilla.
   */
  bodyRegion?: BodyRegion;
}

export type BodyRegion = 'head' | 'throat' | 'belly' | 'arm' | 'hand' | 'leg' | 'foot';

export interface PainIntensity {
  id: string;
  label: string;
  emoji: string;
  color: string;
  /** Fragmento de intensidad: "Me duele {sentence} la cabeza". */
  sentence: string;
}

export interface PainQuality {
  id: string;
  label: string;
  emoji: string;
  color: string;
  /** Oración que se agrega al final; vacía en "No sé" (no aporta nada). */
  sentence?: string;
}

const LOCATION_DEFINITIONS: Omit<PainLocation, 'color'>[] = [
  { id: 'head', label: 'Cabeza', emoji: '🤕', phrase: 'la cabeza', bodyRegion: 'head' },
  { id: 'ear', label: 'Oído', emoji: '👂', phrase: 'el oído' },
  { id: 'mouth', label: 'Boca', emoji: '👄', phrase: 'la boca' },
  { id: 'teeth', label: 'Dientes', emoji: '🦷', phrase: 'los dientes', plural: true },
  { id: 'throat', label: 'Garganta', emoji: '🤒', phrase: 'la garganta', bodyRegion: 'throat' },
  { id: 'belly', label: 'Barriga', emoji: '🩹', phrase: 'la barriga', bodyRegion: 'belly' },
  { id: 'arm', label: 'Brazo', emoji: '💪', phrase: 'el brazo', bodyRegion: 'arm' },
  { id: 'hand', label: 'Mano', emoji: '✋', phrase: 'la mano', bodyRegion: 'hand' },
  { id: 'leg', label: 'Pierna', emoji: '🦵', phrase: 'la pierna', bodyRegion: 'leg' },
  { id: 'foot', label: 'Pie', emoji: '🦶', phrase: 'el pie', bodyRegion: 'foot' },
  { id: 'other', label: 'Otro', emoji: '❓', phrase: 'en otra parte' },
];

export const PAIN_LOCATIONS: PainLocation[] = LOCATION_DEFINITIONS.map((location, index) => ({
  ...location,
  color: [colors.blush, colors.warning, colors.accent, colors.lavender][index % 4],
}));

export const PAIN_INTENSITIES: PainIntensity[] = [
  { id: 'low', label: 'Poquito', emoji: '🙂', sentence: 'un poquito', color: colors.success },
  { id: 'medium', label: 'Medio', emoji: '😕', sentence: 'más o menos', color: colors.warning },
  { id: 'high', label: 'Mucho', emoji: '😣', sentence: 'mucho', color: colors.danger },
];

export const PAIN_QUALITIES: PainQuality[] = [
  { id: 'burn', label: 'Arde', emoji: '🔥', sentence: 'Arde.', color: colors.danger },
  { id: 'itch', label: 'Pica', emoji: '🐜', sentence: 'Pica.', color: colors.warning },
  { id: 'press', label: 'Presiona', emoji: '🤏', sentence: 'Aprieta.', color: colors.accent },
  { id: 'hit', label: 'Golpe', emoji: '👊', sentence: 'Es como un golpe.', color: colors.lavender },
  { id: 'unknown', label: 'No sé', emoji: '🤷', color: colors.textSecondary },
];

/** Arma la oración final, p. ej. "Me duele mucho la cabeza. Arde." */
export function buildPainSentence(
  location: PainLocation,
  intensity: PainIntensity,
  quality?: PainQuality | null,
): string {
  const verb = location.plural ? 'Me duelen' : 'Me duele';
  const base = `${verb} ${intensity.sentence} ${location.phrase}.`;
  return quality?.sentence ? `${base} ${quality.sentence}` : base;
}
