/**
 * Encryption Service using Web Crypto API (SubtleCrypto)
 * AES-256-GCM for authenticated encryption
 *
 * Features:
 * - AES-256-GCM encryption with authenticated encryption
 * - Random IV per encryption (prevents pattern detection)
 * - Automatic serialization/deserialization
 * - PBKDF2 key derivation support for password-based keys
 */

const ALGORITHM = {
  name: "AES-GCM",
  length: 256,
};

const ENCRYPTION_ALGORITHM = {
  name: "AES-GCM",
  length: 256,
};

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded
  tag: string; // Base64 encoded (included in ciphertext for GCM)
  algorithm: string;
  timestamp: number;
}

export class EncryptionService {
  private crypto: SubtleCrypto | null = null;

  constructor() {
    if (typeof window === "undefined") {
      console.warn("[ENCRYPTION] Browser environment not available");
      return;
    }
    const subtle = window.crypto?.subtle;
    if (!subtle) {
      console.warn("[ENCRYPTION] Web Crypto API not available in this browser");
      return;
    }
    this.crypto = subtle;
  }

  /**
   * Check if encryption is available
   */
  isAvailable(): boolean {
    return this.crypto !== null;
  }

  /**
   * Generate a random AES-256 key
   */
  async generateKey(): Promise<CryptoKey> {
    if (!this.isAvailable()) {
      throw new Error("Web Crypto API not available");
    }
    return this.crypto!.generateKey(
      { name: "AES-GCM", length: 256 },
      true, // extractable
      ["encrypt", "decrypt"],
    );
  }

  /**
   * Export key to JWK format for storage in sessionStorage
   */
  async exportKey(key: CryptoKey): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Web Crypto API not available");
    }
    const jwk = await this.crypto!.exportKey("jwk", key);
    return JSON.stringify(jwk);
  }

  /**
   * Import key from JWK format (from sessionStorage)
   */
  async importKey(keyData: string): Promise<CryptoKey> {
    if (!this.isAvailable()) {
      throw new Error("Web Crypto API not available");
    }
    const jwk = JSON.parse(keyData);
    return this.crypto!.importKey(
      "jwk",
      jwk,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
  }

  /**
   * Encrypt plaintext string with AES-256-GCM
   * Returns encrypted data with IV and tag in base64
   */
  async encrypt(plaintext: string, key: CryptoKey): Promise<EncryptedData> {
    if (!this.isAvailable()) {
      throw new Error("Web Crypto API not available");
    }
    try {
      // Generate random IV (12 bytes recommended for AES-GCM)
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Convert plaintext to bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);

      // Encrypt with AES-256-GCM
      const ciphertext = await this.crypto!.encrypt(
        { name: "AES-GCM", iv },
        key,
        data,
      );

      // In GCM mode, the authentication tag is appended to the ciphertext
      // We store everything as base64 for JSON compatibility
      return {
        ciphertext: this.bytesToBase64(new Uint8Array(ciphertext)),
        iv: this.bytesToBase64(iv),
        tag: "", // GCM tag is included in ciphertext
        algorithm: "AES-256-GCM",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("[ENCRYPTION] Failed to encrypt:", error);
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  /**
   * Decrypt encrypted data with AES-256-GCM
   * Returns original plaintext string
   */
  async decrypt(encrypted: EncryptedData, key: CryptoKey): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("Web Crypto API not available");
    }
    try {
      // Decode base64 back to bytes
      const ciphertext = this.base64ToBytes(encrypted.ciphertext);
      const iv = this.base64ToBytes(encrypted.iv);

      // Decrypt with AES-256-GCM
      const plaintext = await this.crypto!.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext,
      );

      // Convert bytes back to string
      const decoder = new TextDecoder();
      return decoder.decode(plaintext);
    } catch (error) {
      console.error("[ENCRYPTION] Failed to decrypt:", error);
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  /**
   * Derive a key from a password using PBKDF2
   * Useful for password-based encryption (fallback if sessionStorage lost)
   */
  async deriveKeyFromPassword(
    password: string,
    salt: Uint8Array = crypto.getRandomValues(new Uint8Array(16)),
  ): Promise<{ key: CryptoKey; salt: string }> {
    if (!this.isAvailable()) {
      throw new Error("Web Crypto API not available");
    }
    try {
      // Import password as key material
      const keyMaterial = await this.crypto!.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"],
      );

      // Derive key using PBKDF2
      const key = await this.crypto!.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      );

      return {
        key,
        salt: this.bytesToBase64(salt),
      };
    } catch (error) {
      console.error("[ENCRYPTION] Failed to derive key from password:", error);
      throw new Error(
        `Key derivation failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  /**
   * Helper: Convert Uint8Array to Base64
   */
  private bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Helper: Convert Base64 to Uint8Array
   */
  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Check if SubtleCrypto is available
   */
  static isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.crypto?.subtle;
  }
}

export const encryptionService = new EncryptionService();
