import { SOUND_ASSETS } from './soundAssets';

export interface TouchAndListenSound {
  id: string;
  emoji: string;
  label: string;
  /** Efecto de sonido real, empaquetado localmente (ver `soundAssets.ts`). */
  asset: number;
}

export const TOUCH_AND_LISTEN_SOUNDS: TouchAndListenSound[] = [
  { id: 'bird', emoji: '🐦', label: 'Pájaro', asset: SOUND_ASSETS.bird },
  { id: 'water', emoji: '💧', label: 'Agua', asset: SOUND_ASSETS.waterDrop },
  { id: 'wave', emoji: '🌊', label: 'Ola', asset: SOUND_ASSETS.waves },
  { id: 'bell', emoji: '🔔', label: 'Campana', asset: SOUND_ASSETS.bell },
  { id: 'drum', emoji: '🥁', label: 'Tambor', asset: SOUND_ASSETS.drum },
  { id: 'clap', emoji: '👏', label: 'Aplauso', asset: SOUND_ASSETS.clap },
  { id: 'cat', emoji: '🐱', label: 'Gato', asset: SOUND_ASSETS.cat },
  { id: 'car', emoji: '🚗', label: 'Auto', asset: SOUND_ASSETS.carHorn },
];
