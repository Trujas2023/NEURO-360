import * as Crypto from 'expo-crypto';

/**
 * El PIN de Modo Adulto sigue siendo una barrera parental, no un mecanismo
 * de seguridad criptográfica de nivel bancario (mismo criterio que ya
 * documentaba el proyecto). El hash solo evita que quede legible en texto
 * plano por cualquier herramienta de inspección del almacenamiento del
 * dispositivo (ver docs/PRODUCT_MASTER_SPEC.md §7.3.5).
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}
