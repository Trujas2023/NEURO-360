import * as Haptics from 'expo-haptics';

/**
 * Vibración suave (nunca fuerte ni prolongada) para confirmar un toque en
 * las actividades sensoriales. Siempre "light": el objetivo es un
 * refuerzo táctil apenas perceptible, no una alarma.
 *
 * Falla en silencio a propósito: hay dispositivos sin motor háptico o con
 * la vibración desactivada a nivel de sistema, y eso no debe romper una
 * actividad ni mostrarle un error al niño.
 */
export function softTap(enabled: boolean): void {
  if (!enabled) {
    return;
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
