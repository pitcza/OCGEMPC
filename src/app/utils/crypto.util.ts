import * as CryptoJS from 'crypto-js';

/**
 * Decrypts AES-256-CBC encrypted data from the backend.
 * @param encrypted The encrypted string in the format 'iv_base64:data_base64'
 * @param key The encryption key (must match backend key)
 * @returns The decrypted JSON object
 */
export function decryptResponse(encrypted: string, key: string): any {
  const [ivBase64, dataBase64] = encrypted.split(':');
  const iv = CryptoJS.enc.Base64.parse(ivBase64);
  const encryptedData = CryptoJS.enc.Base64.parse(dataBase64);
  // CryptoJS expects key and iv as WordArray
  const keyWA = CryptoJS.enc.Utf8.parse(key);
  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: encryptedData } as any,
    keyWA,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedText);
}
