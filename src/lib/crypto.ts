import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_HEX = process.env.ENCRYPTION_KEY ?? "";

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    // Dev fallback: deterministic 32-byte key — NOT safe for production
    return Buffer.from("velox_dev_key_not_for_production_use__padding", "utf8").subarray(0, 32);
  }
  return Buffer.from(KEY_HEX, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns the base64-encoded ciphertext and hex IV string.
 */
export function encrypt(plaintext: string): { ciphertext: string; iv: string } {
  const key = getKey();
  const iv = randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag(); // 16-byte auth tag
  // Store: ciphertext + authTag together, so we can verify integrity on decrypt
  const combined = Buffer.concat([encrypted, authTag]);

  return {
    ciphertext: combined.toString("base64"),
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypt a base64 ciphertext using AES-256-GCM.
 * Throws if the ciphertext has been tampered with.
 */
export function decrypt(ciphertext: string, iv: string): string {
  const key = getKey();
  const combined = Buffer.from(ciphertext, "base64");

  // Last 16 bytes are the auth tag
  const authTag = combined.subarray(combined.length - 16);
  const encrypted = combined.subarray(0, combined.length - 16);

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, "hex"));
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
