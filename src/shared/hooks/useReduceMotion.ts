import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * `reduceMotion` real (R1, ver docs/UX_UI_SYSTEM_SPEC.md §5.5). Antes de
 * R1, `ChildProfilePreferences.reduceMotion` se guardaba pero no se leía
 * en ningún lugar del código — este hook es lo que cierra ese hallazgo de
 * la auditoría (placeholder → efecto real).
 *
 * Combina la preferencia del perfil activo con el ajuste de accesibilidad
 * del sistema operativo: cualquiera de los dos activo reduce el
 * movimiento. Se recibe la preferencia del perfil como parámetro (en vez
 * de leerla aquí desde `ProfilesContext`) para que `shared/hooks` no
 * dependa de `features/profiles` (ver docs/ARCHITECTURE.md: "shared" es
 * transversal, no depende de features).
 */
export function useReduceMotion(profilePreference?: boolean): boolean {
  const [osReduceMotion, setOsReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) {
        setOsReduceMotion(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setOsReduceMotion(enabled);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return (profilePreference ?? false) || osReduceMotion;
}
