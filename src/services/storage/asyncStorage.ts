import AsyncStorage from '@react-native-async-storage/async-storage';

/** Wrapper JSON tipado sobre AsyncStorage, base común para los repositorios locales. */
export async function getItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Dato corrupto o de un formato anterior: se ignora en lugar de romper la app.
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
