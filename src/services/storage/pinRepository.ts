import { getItem, setItem } from './asyncStorage';

const ADULT_PIN_KEY = 'sense-play/adult-pin';

/**
 * El PIN de Modo Adulto es una barrera parental (evitar que un niño entre
 * por accidente a la configuración), no un mecanismo de seguridad
 * criptográfica. Por eso se guarda tal cual en el almacenamiento local del
 * dispositivo, igual que el resto de los datos offline-first de la app.
 */

export async function hasAdultPin(): Promise<boolean> {
  const pin = await getItem<string>(ADULT_PIN_KEY);
  return pin !== null;
}

export async function setAdultPin(pin: string): Promise<void> {
  await setItem(ADULT_PIN_KEY, pin);
}

export async function verifyAdultPin(pin: string): Promise<boolean> {
  const storedPin = await getItem<string>(ADULT_PIN_KEY);
  return storedPin !== null && storedPin === pin;
}
