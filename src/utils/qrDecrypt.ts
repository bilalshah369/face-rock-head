import CryptoJS from 'crypto-js';
import {QR_IV, QR_SECRET} from '@env';
const QR_IV_parsed = CryptoJS.enc.Utf8.parse(QR_IV); // must match backend

export const decryptQR = (encryptedText: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      encryptedText,
      CryptoJS.enc.Utf8.parse(QR_SECRET),
      {
        iv: QR_IV_parsed,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (err) {
    console.error('QR decrypt failed', err);
    return null;
  }
};
