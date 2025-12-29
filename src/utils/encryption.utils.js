import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-secret-encryption-key-change-in-production";

export const encryptMessage = (message) => {
  if (!message) return "";
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
};

export const decryptMessage = (encryptedMessage) => {
  if (!encryptedMessage) return "";

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (decrypted) return decrypted;
  } catch (error) {
    // ignore and return input
  }

  return encryptedMessage;
};

export default { encryptMessage, decryptMessage };
