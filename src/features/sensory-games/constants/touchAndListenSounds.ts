export interface TouchAndListenSound {
  id: string;
  emoji: string;
  label: string;
  /**
   * No hay servicios externos ni archivos de audio empaquetados: cada
   * sonido se reproduce con texto a voz local (`@services/audio/speech`),
   * generado en el dispositivo. `cue` es la onomatopeya que se "habla".
   */
  cue: string;
}

export const TOUCH_AND_LISTEN_SOUNDS: TouchAndListenSound[] = [
  { id: 'bird', emoji: '🐦', label: 'Pájaro', cue: 'pío pío' },
  { id: 'water', emoji: '💧', label: 'Agua', cue: 'splash' },
  { id: 'wave', emoji: '🌊', label: 'Ola', cue: 'shhh' },
  { id: 'bell', emoji: '🔔', label: 'Campana', cue: 'din don' },
  { id: 'drum', emoji: '🥁', label: 'Tambor', cue: 'pum pum' },
  { id: 'clap', emoji: '👏', label: 'Aplauso', cue: 'clap clap' },
  { id: 'cat', emoji: '🐱', label: 'Gato', cue: 'miau' },
  { id: 'car', emoji: '🚗', label: 'Auto', cue: 'bip bip' },
];
