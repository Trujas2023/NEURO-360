import { getSetting, setSetting } from './db';
import { hashPin } from './pinHash';

const PIN_HASH_KEY = 'adultPinHash';
const PIN_SALT_KEY = 'adultPinSalt';

async function getOrCreateSalt(): Promise<string> {
  const existing = await getSetting(PIN_SALT_KEY);
  if (existing) {
    return existing;
  }
  const { randomUUID } = await import('expo-crypto');
  const salt = randomUUID();
  await setSetting(PIN_SALT_KEY, salt);
  return salt;
}

export async function hasAdultPin(): Promise<boolean> {
  const hash = await getSetting(PIN_HASH_KEY);
  return hash !== null;
}

export async function setAdultPin(pin: string): Promise<void> {
  const salt = await getOrCreateSalt();
  const hash = await hashPin(pin, salt);
  await setSetting(PIN_HASH_KEY, hash);
}

export async function verifyAdultPin(pin: string): Promise<boolean> {
  const stored = await getSetting(PIN_HASH_KEY);
  if (stored === null) {
    return false;
  }
  const salt = await getOrCreateSalt();
  const hash = await hashPin(pin, salt);
  return hash === stored;
}

/** Usado solo por la migración de datos heredados (ver migrateFromAsyncStorage.ts). */
export async function setAdultPinHashDirect(hash: string, salt: string): Promise<void> {
  await setSetting(PIN_SALT_KEY, salt);
  await setSetting(PIN_HASH_KEY, hash);
}
