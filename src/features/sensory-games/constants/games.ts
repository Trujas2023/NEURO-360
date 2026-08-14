import { colors } from '@shared/theme';

import type { SensoryGameInfo } from '../types';

/**
 * Catálogo de los seis juegos de "Juega & Regula" (ver README del feature).
 * Las Fases 6-7 los completan uno a uno; los que todavía no tienen `route`
 * navegan a `ComingSoon` con su propio título/emoji.
 */
export const SENSORY_GAMES: SensoryGameInfo[] = [
  {
    id: 'bubble-pop',
    title: 'Revienta burbujas',
    emoji: '🫧',
    color: colors.accent,
    route: 'BubblePop',
  },
  { id: 'sensory-paint', title: 'Pintura sensorial', emoji: '🎨', color: colors.secondary },
  { id: 'touch-and-listen', title: 'Toca y escucha', emoji: '👂', color: colors.lavender },
  { id: 'follow-the-color', title: 'Sigue el color', emoji: '🌈', color: colors.blush },
  { id: 'how-i-feel', title: '¿Cómo me siento?', emoji: '🙂', color: colors.success },
  { id: 'breathe-with-me', title: 'Respira conmigo', emoji: '🫁', color: colors.primary },
];
