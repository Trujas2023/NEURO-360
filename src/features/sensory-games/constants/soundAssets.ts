import bell from '@assets/sounds/sensory/bell.wav';
import bird from '@assets/sounds/sensory/bird.wav';
import bubblePop from '@assets/sounds/sensory/bubble_pop.wav';
import carHorn from '@assets/sounds/sensory/car_horn.wav';
import cat from '@assets/sounds/sensory/cat.wav';
import clap from '@assets/sounds/sensory/clap.wav';
import drum from '@assets/sounds/sensory/drum.wav';
import sparkle from '@assets/sounds/sensory/sparkle.wav';
import waterDrop from '@assets/sounds/sensory/water_drop.wav';
import waves from '@assets/sounds/sensory/waves.wav';

/**
 * Efectos de sonido reales, generados una sola vez y empaquetados en
 * `assets/sounds/sensory/` (WAV, mono, 22.05 kHz). Metro los incluye en el
 * binario de la app: no hay texto a voz ni servicios externos, y no se
 * descarga nada en tiempo de ejecución.
 */
export const SOUND_ASSETS = {
  bubblePop,
  bird,
  waterDrop,
  waves,
  bell,
  drum,
  clap,
  cat,
  carHorn,
  sparkle,
} as const;
