/**
 * Encrypted Storage Service
 * Wrapper around localStorage for transparent encryption/decryption
 *
 * Features:
 * - Transparent encrypt on write, decrypt on read
 * - Handles migration from unencrypted to encrypted data
 * - Secure deletion with overwriting
 * - Error recovery with fallback to empty state
 */

import type { EncryptedData } from './encryption';

/**
 * List of localStorage keys that should be encrypted
 */
const ENCRYPTED_KEYS = [
  // Auth & User Data
  'erp_user_session',
  'userData',
  
  // Business Configuration
  'businessData',
  'businessSettings',
  'teamUsers',
  
  // Main Application State (Primary Data Stores)
  'erp_system_state',           // Main app state (products, inventory, sales, suppliers, reports)
  'erp_system_merged_cache',    // Merged cache of system state
  'erp_system_offline_items',   // Offline sync queue
];

// Lazy-loaded services to prevent SSR issues
let encryptionService: any = null;
let sessionKeyManager: any = null;

function getEncryptionService() {
  if (typeof window === 'undefined') {
    throw new Error('EncryptedStorageService requires browser environment');
  }
  if (!encryptionService) {
    const { encryptionService: service } = require('./encryption');
    encryptionService = service;
  }
  return encryptionService;
}

function getSessionKeyManager() {
  if (typeof window === 'undefined') {
    throw new Error('EncryptedStorageService requires browser environment');
  }
  if (!sessionKeyManager) {
    const { sessionKeyManager: manager } = require('./sessionKeyManager');
    sessionKeyManager = manager;
  }
  return sessionKeyManager;
}

class EncryptedStorageService {
  /**
   * Get and decrypt a value from localStorage
   * Returns null if key doesn't exist or decryption fails
   */
  async getDecrypted<T = any>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      // Check if encryption is available
      const encryption = getEncryptionService();
      if (!encryption.isAvailable()) {
        console.warn(`[ENCRYPTED_STORAGE] Encryption not available, returning plain data for key "${key}"`);
        try {
          return JSON.parse(stored) as T;
        } catch {
          return stored as T;
        }
      }

      // Check if data is encrypted (has JSON with ciphertext field)
      let encrypted: EncryptedData;
      try {
        encrypted = JSON.parse(stored);
        if (!encrypted.ciphertext || !encrypted.iv) {
          // Old format or invalid - treat as plain text for backward compatibility
          console.warn(`[ENCRYPTED_STORAGE] Key "${key}" not in encrypted format, returning as-is`, { preview: stored.substring(0, 50) });
          return JSON.parse(stored) as T;
        }
      } catch (parseError) {
        // Not JSON - might be legacy plain text
        console.warn(`[ENCRYPTED_STORAGE] Key "${key}" is not JSON, returning as-is`);
        return stored as T;
      }

      // Decrypt
      const decryptionKey = await getSessionKeyManager().getKey();
      const plaintext = await encryption.decrypt(encrypted, decryptionKey);

      // Parse decrypted JSON
      const decrypted = JSON.parse(plaintext) as T;
      console.log(`✅ [ENCRYPTED_STORAGE] Decrypted key: "${key}"`);
      return decrypted;
    } catch (error) {
      console.error(`❌ [ENCRYPTED_STORAGE] Failed to decrypt key "${key}":`, error);
      
      // Corruption detected - try to recover
      try {
        console.warn(`[ENCRYPTED_STORAGE] Attempting recovery by clearing corrupted key "${key}"`);
        localStorage.removeItem(key);
      } catch (clearError) {
        console.error(`[ENCRYPTED_STORAGE] Failed to clear corrupted key:`, clearError);
      }
      
      return null;
    }
  }

  /**
   * Encrypt and store a value in localStorage
   */
  async setEncrypted<T = any>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const encryption = getEncryptionService();
      if (!encryption.isAvailable()) {
        console.warn(`[ENCRYPTED_STORAGE] Encryption not available, storing plain data for key "${key}"`);
        localStorage.setItem(key, JSON.stringify(value));
        return;
      }

      const decryptionKey = await getSessionKeyManager().getKey();
      const plaintext = JSON.stringify(value);
      const encrypted = await encryption.encrypt(plaintext, decryptionKey);

      localStorage.setItem(key, JSON.stringify(encrypted));
      console.log(`✅ [ENCRYPTED_STORAGE] Encrypted and stored key: "${key}"`);
    } catch (error) {
      console.error(`❌ [ENCRYPTED_STORAGE] Failed to encrypt key "${key}":`, error);
      throw new Error(`Failed to save encrypted data for key "${key}": ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  /**
   * Check if a key exists and is encrypted
   */
  isEncrypted(key: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return false;

      const parsed = JSON.parse(stored);
      return !!(parsed.ciphertext && parsed.iv && parsed.algorithm);
    } catch {
      return false;
    }
  }

  /**
   * Migrate unencrypted data to encrypted format
   * Useful for one-time migration when enabling encryption
   */
  async migrateToEncrypted(key: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if (this.isEncrypted(key)) {
        console.log(`[ENCRYPTED_STORAGE] Key "${key}" is already encrypted`);
        return true;
      }

      const stored = localStorage.getItem(key);
      if (!stored) {
        console.log(`[ENCRYPTED_STORAGE] Key "${key}" does not exist`);
        return false;
      }

      // Parse and re-encrypt
      const value = JSON.parse(stored);
      await this.setEncrypted(key, value);
      console.log(`✅ [ENCRYPTED_STORAGE] Migrated key "${key}" to encrypted format`);
      return true;
    } catch (error) {
      console.error(`❌ [ENCRYPTED_STORAGE] Failed to migrate key "${key}":`, error);
      return false;
    }
  }

  /**
   * Securely delete encrypted data
   * Overwrites with random data before removal
   */
  async secureDelete(key: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Overwrite with random data
      const randomData = crypto.getRandomValues(new Uint8Array(256));
      const randomString = Array.from(randomData).map(b => b.toString(16)).join('');
      localStorage.setItem(key, randomString);

      // Then remove
      localStorage.removeItem(key);
      console.log(`✅ [ENCRYPTED_STORAGE] Securely deleted key: "${key}"`);
    } catch (error) {
      console.error(`❌ [ENCRYPTED_STORAGE] Failed to securely delete key "${key}":`, error);
    }
  }

  /**
   * Get list of encrypted keys in localStorage
   */
  getEncryptedKeys(): string[] {
    if (typeof window === 'undefined') return [];

    try {
      const encryptedKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.isEncrypted(key)) {
          encryptedKeys.push(key);
        }
      }
      return encryptedKeys;
    } catch (error) {
      console.error('[ENCRYPTED_STORAGE] Failed to get encrypted keys:', error);
      return [];
    }
  }

  /**
   * Clear all encrypted data (for logout)
   */
  async clearAllEncrypted(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const encryptedKeys = this.getEncryptedKeys();
      
      for (const key of encryptedKeys) {
        await this.secureDelete(key);
      }

      console.log(`✅ [ENCRYPTED_STORAGE] Cleared all encrypted data (${encryptedKeys.length} keys)`);
    } catch (error) {
      console.error('[ENCRYPTED_STORAGE] Failed to clear encrypted data:', error);
    }
  }

  /**
   * Get encryption status for all sensitive keys
   */
  getEncryptionStatus(): Record<string, { encrypted: boolean; exists: boolean }> {
    if (typeof window === 'undefined') return {};

    const status: Record<string, { encrypted: boolean; exists: boolean }> = {};

    for (const key of ENCRYPTED_KEYS) {
      const exists = localStorage.getItem(key) !== null;
      const encrypted = exists ? this.isEncrypted(key) : false;
      status[key] = { encrypted, exists };
    }

    return status;
  }
}

export const encryptedStorageService = new EncryptedStorageService();
