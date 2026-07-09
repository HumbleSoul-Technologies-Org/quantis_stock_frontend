/**
 * Session Key Manager
 * Manages encryption key lifecycle in sessionStorage
 *
 * Features:
 * - Generate and store AES-256 key per session
 * - Automatic key rotation (optional)
 * - Clear key on logout
 * - Recover key from sessionStorage on page load
 */

const SESSION_KEY_STORAGE = "__encryption_key__";
const SESSION_KEY_METADATA = "__encryption_key_metadata__";
// Persistent exported key stored as JWK string for recovery across tabs/restarts
const PERSISTENT_KEY_STORAGE = "__encryption_key_persistent__";
const PERSISTENT_PWD_SALT = "__encryption_pwd_salt__";
const PERSISTENT_TYPE = "__encryption_persistent_type__"; // 'exported' | 'password'

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Lazy-loaded service to prevent SSR issues
let encryptionService: any = null;

function getEncryptionService() {
  if (typeof window === "undefined") {
    throw new Error("SessionKeyManager requires browser environment");
  }
  if (!encryptionService) {
    const { encryptionService: service } = require("./encryption");
    encryptionService = service;
  }
  return encryptionService;
}

interface KeyMetadata {
  createdAt: number;
  rotatedAt: number;
  rotationCount: number;
  sessionId: string;
}

class SessionKeyManager {
  private currentKey: CryptoKey | null = null;
  private metadata: KeyMetadata | null = null;
  private keyRotationInterval: NodeJS.Timeout | null = null;
  private initialized = false;
  private readonly KEY_ROTATION_TIME = 60 * 60 * 1000; // 1 hour

  /**
   * Initialize session key on app load
   * Tries to recover existing key from sessionStorage, or creates new one
   */
  async initialize(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("SessionKeyManager requires browser environment");
    }

    const encryption = getEncryptionService();
    if (!encryption.isAvailable()) {
      console.warn(
        "[SESSION_KEY] Web Crypto API not available - skipping key initialization",
      );
      this.initialized = true;
      return;
    }

    try {
      // Check if key already exists in sessionStorage
      const storedKey = sessionStorage.getItem(SESSION_KEY_STORAGE);
      const storedMetadata = sessionStorage.getItem(SESSION_KEY_METADATA);

      if (storedKey && storedMetadata) {
        console.log(
          "🔑 [SESSION_KEY] Recovering existing session key from sessionStorage",
        );
        this.currentKey = await encryption.importKey(storedKey);
        this.metadata = JSON.parse(storedMetadata);

        // Check if rotation is needed
        if (this.shouldRotate()) {
          console.log(
            "🔄 [SESSION_KEY] Key rotation time exceeded - generating new key",
          );
          await this.rotateKey();
        }

        return;
      }

      // Fallback: try persistent exported key from localStorage (survives tab restarts)
      // Fallback: check persistent storage type
      try {
        const persistentType =
          localStorage.getItem(PERSISTENT_TYPE) || "exported";
        if (persistentType === "exported") {
          const persistent = localStorage.getItem(PERSISTENT_KEY_STORAGE);
          if (persistent) {
            console.log(
              "🔁 [SESSION_KEY] Recovering persistent exported key from localStorage",
            );
            this.currentKey = await encryption.importKey(persistent);
            this.metadata = JSON.parse(
              localStorage.getItem(SESSION_KEY_METADATA) || "null",
            ) || {
              createdAt: Date.now(),
              rotatedAt: Date.now(),
              rotationCount: 1,
              sessionId: this.generateSessionId(),
            };

            // Mirror into sessionStorage for current tab
            sessionStorage.setItem(SESSION_KEY_STORAGE, persistent);
            sessionStorage.setItem(
              SESSION_KEY_METADATA,
              JSON.stringify(this.metadata),
            );

            if (this.shouldRotate()) {
              console.log(
                "🔄 [SESSION_KEY] Key rotation time exceeded - generating new key",
              );
              await this.rotateKey();
            }

            return;
          }
        } else if (persistentType === "password") {
          // Password-derived persistent key: we have a salt stored, but we need the user's password to derive the key.
          const saltB64 = localStorage.getItem(PERSISTENT_PWD_SALT);
          if (saltB64) {
            console.log(
              "🔐 [SESSION_KEY] Password-derived key present; awaiting user password to derive key",
            );
            // Do not auto-generate a new key here to avoid losing ability to recover existing encrypted data.
            this.initialized = true; // mark initialized but currentKey remains null until user restores
            return;
          }
        }
      } catch (e) {
        console.warn("[SESSION_KEY] persistent key recovery failed:", e);
      }

      // No existing key - generate new one
      console.log("🔐 [SESSION_KEY] Generating new session encryption key");
      await this.createNewKey();
    } catch (error) {
      console.error("[SESSION_KEY] Failed to initialize key:", error);
      // Fallback: generate new key to preserve encryption flow
      await this.createNewKey();
    } finally {
      this.initialized = true;
    }
  }

  /**
   * Get current session key
   * Initializes key if not already done
   */
  async getKey(): Promise<CryptoKey> {
    if (!this.initialized) {
      await this.initialize();
    }

    const encryption = getEncryptionService();
    if (!encryption.isAvailable()) {
      throw new Error("Web Crypto API not available");
    }

    if (this.currentKey) {
      // Check if rotation is needed
      if (this.shouldRotate()) {
        console.log(
          "🔄 [SESSION_KEY] Key rotation time exceeded - generating new key",
        );
        await this.rotateKey();
      }

      return this.currentKey;
    }

    throw new Error("Session key is not initialized");
  }

  /**
   * Check if session key is initialized
   */
  isInitialized(): boolean {
    return this.currentKey !== null;
  }

  /**
   * Rotate encryption key (creates new key, stores old key temporarily)
   */
  async rotateKey(): Promise<CryptoKey> {
    console.log(
      "🔄 [SESSION_KEY] Rotating encryption key (re-encrypting stored items)",
    );
    const encryption = getEncryptionService();
    if (!encryption.isAvailable()) {
      console.warn(
        "[SESSION_KEY] Web Crypto API not available - rotating without re-encrypt",
      );
      return await this.createNewKey();
    }

    if (!this.currentKey) {
      console.warn("[SESSION_KEY] No current key available, creating new key");
      return await this.createNewKey();
    }

    // Try to load encryptedStorageService to enumerate encrypted keys
    let encryptedStorageService: any = null;
    try {
      ({ encryptedStorageService } = require("./encryptedStorage"));
    } catch (e) {
      console.warn(
        "[SESSION_KEY] Could not load encryptedStorageService, rotating without re-encrypt",
        e,
      );
      return await this.createNewKey();
    }

    const oldKey = this.currentKey;

    try {
      // Generate new key but do not replace currentKey until re-encryption finishes
      const newKey = await encryption.generateKey();
      const newKeyString = await encryption.exportKey(newKey);

      // Get list of encrypted keys from storage
      const keys: string[] = [];
      try {
        if (typeof encryptedStorageService.getEncryptedKeys === "function") {
          const found = encryptedStorageService.getEncryptedKeys();
          if (Array.isArray(found)) keys.push(...found);
        }
      } catch (e) {
        console.warn("[SESSION_KEY] Failed to get encrypted keys:", e);
      }

      // Re-encrypt each stored item: decrypt with oldKey, encrypt with newKey
      for (const key of keys) {
        try {
          const stored = localStorage.getItem(key);
          if (!stored) continue;

          // Only attempt if it's JSON with ciphertext/iv
          let parsed: any;
          try {
            parsed = JSON.parse(stored);
          } catch {
            continue;
          }

          if (!parsed || !parsed.ciphertext || !parsed.iv) continue;

          // Decrypt with old key
          let plaintext: string;
          try {
            plaintext = await encryption.decrypt(parsed, oldKey);
          } catch (e) {
            console.warn(
              `[SESSION_KEY] Skipping key ${key} - decryption with old key failed:`,
              e,
            );
            continue;
          }

          // Encrypt with new key
          try {
            const newEncrypted = await encryption.encrypt(plaintext, newKey);
            localStorage.setItem(key, JSON.stringify(newEncrypted));
          } catch (e) {
            console.warn(
              `[SESSION_KEY] Failed to re-encrypt key ${key} with new key:`,
              e,
            );
            // Try to restore original value if we wiped it (we didn't overwrite until success)
            continue;
          }
        } catch (e) {
          console.warn(
            `[SESSION_KEY] Unexpected error migrating key ${key}:`,
            e,
          );
          continue;
        }
      }

      // Update metadata and persist the new key
      const now = Date.now();
      this.metadata = {
        createdAt: this.metadata?.createdAt ?? now,
        rotatedAt: now,
        rotationCount: (this.metadata?.rotationCount ?? 0) + 1,
        sessionId: this.metadata?.sessionId ?? this.generateSessionId(),
      };

      // Persist new exported key and metadata
      try {
        sessionStorage.setItem(SESSION_KEY_STORAGE, newKeyString);
        sessionStorage.setItem(
          SESSION_KEY_METADATA,
          JSON.stringify(this.metadata),
        );
        try {
          localStorage.setItem(PERSISTENT_KEY_STORAGE, newKeyString);
        } catch (e) {
          console.warn(
            "[SESSION_KEY] Failed to persist new exported key to localStorage:",
            e,
          );
        }
      } catch (e) {
        console.warn("[SESSION_KEY] Failed to persist new key to storage:", e);
      }

      // Finally switch to the new key
      this.currentKey = newKey;

      console.log("✅ [SESSION_KEY] Rotation complete", {
        sessionId: this.metadata.sessionId,
        rotationCount: this.metadata.rotationCount,
      });

      return newKey;
    } catch (error) {
      console.error(
        "[SESSION_KEY] Rotation failed, falling back to creating new key:",
        error,
      );
      return await this.createNewKey();
    }
  }

  /**
   * Clear session key (on logout)
   */
  lockKey(): void {
    console.log(
      "🔒 [SESSION_KEY] Locking session key (clearing from memory and storage)",
    );
    this.currentKey = null;
    this.metadata = null;

    // Clear from sessionStorage
    sessionStorage.removeItem(SESSION_KEY_STORAGE);
    sessionStorage.removeItem(SESSION_KEY_METADATA);

    // Clear rotation interval if exists
    if (this.keyRotationInterval) {
      clearInterval(this.keyRotationInterval);
      this.keyRotationInterval = null;
    }
  }

  /**
   * Get key metadata
   */
  getMetadata(): KeyMetadata | null {
    return this.metadata;
  }

  /**
   * Enable password-derived persistent key. Derives a key from the provided password,
   * stores the salt in localStorage and marks persistent type as 'password'.
   */
  async enablePasswordPersistence(password: string): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("SessionKeyManager requires browser environment");
    }

    const encryption = getEncryptionService();
    if (!encryption.isAvailable()) {
      throw new Error("Web Crypto API not available");
    }

    const { key, salt } = await encryption.deriveKeyFromPassword(password);
    this.currentKey = key;

    // persist salt and type
    try {
      localStorage.setItem(PERSISTENT_PWD_SALT, salt);
      localStorage.setItem(PERSISTENT_TYPE, "password");
      // mirror exported key into sessionStorage for current tab
      const exported = await encryption.exportKey(key);
      sessionStorage.setItem(SESSION_KEY_STORAGE, exported);
      sessionStorage.setItem(
        SESSION_KEY_METADATA,
        JSON.stringify(
          this.metadata ?? {
            createdAt: Date.now(),
            rotatedAt: Date.now(),
            rotationCount: this.metadata?.rotationCount ?? 1,
            sessionId: this.metadata?.sessionId ?? this.generateSessionId(),
          },
        ),
      );

      // remove any previously persisted exported key to avoid confusion
      try {
        localStorage.removeItem(PERSISTENT_KEY_STORAGE);
      } catch {}
    } catch (e) {
      console.warn(
        "[SESSION_KEY] Failed to persist password-derived metadata:",
        e,
      );
    }
  }

  /**
   * Restore session key from a user password using stored salt. Returns true if successful.
   */
  async restoreFromPassword(password: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const encryption = getEncryptionService();
    if (!encryption.isAvailable()) return false;

    const saltB64 = localStorage.getItem(PERSISTENT_PWD_SALT);
    if (!saltB64) return false;

    try {
      const salt = base64ToBytes(saltB64);
      const { key } = await encryption.deriveKeyFromPassword(password, salt);
      this.currentKey = key;

      // mirror into sessionStorage
      try {
        const exported = await encryption.exportKey(key);
        sessionStorage.setItem(SESSION_KEY_STORAGE, exported);
        this.metadata = this.metadata ?? {
          createdAt: Date.now(),
          rotatedAt: Date.now(),
          rotationCount: 1,
          sessionId: this.generateSessionId(),
        };
        sessionStorage.setItem(
          SESSION_KEY_METADATA,
          JSON.stringify(this.metadata),
        );
      } catch (e) {
        console.warn(
          "[SESSION_KEY] Failed to mirror derived key into sessionStorage:",
          e,
        );
      }

      return true;
    } catch (error) {
      console.warn(
        "[SESSION_KEY] Failed to derive key from provided password:",
        error,
      );
      return false;
    }
  }

  /**
   * Private: Create new key and store it
   */
  private async createNewKey(): Promise<CryptoKey> {
    const encryption = getEncryptionService();
    if (!encryption.isAvailable()) {
      throw new Error("Web Crypto API not available");
    }

    try {
      const newKey = await encryption.generateKey();
      const keyString = await encryption.exportKey(newKey);

      // Create metadata
      const now = Date.now();
      this.metadata = {
        createdAt: now,
        rotatedAt: now,
        rotationCount: (this.metadata?.rotationCount ?? 0) + 1,
        sessionId: this.generateSessionId(),
      };

      // Store in sessionStorage (cleared on tab close)
      sessionStorage.setItem(SESSION_KEY_STORAGE, keyString);
      sessionStorage.setItem(
        SESSION_KEY_METADATA,
        JSON.stringify(this.metadata),
      );

      // Also persist exported key as a fallback so encrypted localStorage can be recovered across restarts
      // Persist exported key as fallback only if persistent type is not password
      try {
        const persistentType =
          localStorage.getItem(PERSISTENT_TYPE) || "exported";
        if (persistentType !== "password") {
          localStorage.setItem(PERSISTENT_KEY_STORAGE, keyString);
          localStorage.setItem(PERSISTENT_TYPE, "exported");
        }
      } catch (e) {
        console.warn(
          "[SESSION_KEY] Failed to write persistent key to localStorage:",
          e,
        );
      }

      this.currentKey = newKey;

      console.log("✅ [SESSION_KEY] New session key created and stored", {
        sessionId: this.metadata.sessionId,
        rotationCount: this.metadata.rotationCount,
      });

      return newKey;
    } catch (error) {
      console.error("[SESSION_KEY] Failed to create new key:", error);
      throw new Error(
        `Failed to create session key: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  /**
   * Private: Check if key rotation is needed
   */
  private shouldRotate(): boolean {
    if (!this.metadata) return false;
    const age = Date.now() - this.metadata.rotatedAt;
    return age > this.KEY_ROTATION_TIME;
  }

  /**
   * Private: Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start automatic key rotation (optional)
   */
  startAutoRotation(): void {
    if (this.keyRotationInterval) {
      console.warn("[SESSION_KEY] Auto-rotation already started");
      return;
    }

    this.keyRotationInterval = setInterval(async () => {
      try {
        console.log("🔄 [SESSION_KEY] Auto-rotating key (scheduled)");
        await this.rotateKey();
      } catch (error) {
        console.error("[SESSION_KEY] Auto-rotation failed:", error);
      }
    }, this.KEY_ROTATION_TIME);

    console.log("✅ [SESSION_KEY] Auto-rotation started (1 hour interval)");
  }

  /**
   * Stop automatic key rotation
   */
  stopAutoRotation(): void {
    if (this.keyRotationInterval) {
      clearInterval(this.keyRotationInterval);
      this.keyRotationInterval = null;
      console.log("⏹️ [SESSION_KEY] Auto-rotation stopped");
    }
  }

  /**
   * Clear session key (for logout or security)
   * Removes key from memory and sessionStorage
   */
  clearKey(): void {
    if (typeof window === "undefined") return;

    try {
      // Clear in-memory key
      this.currentKey = null;
      this.metadata = null;

      // Clear from sessionStorage
      sessionStorage.removeItem(SESSION_KEY_STORAGE);
      sessionStorage.removeItem(SESSION_KEY_METADATA);

      // Also clear persistent fallback and password salt/type
      try {
        localStorage.removeItem(PERSISTENT_KEY_STORAGE);
        localStorage.removeItem(SESSION_KEY_METADATA);
        localStorage.removeItem(PERSISTENT_PWD_SALT);
        localStorage.removeItem(PERSISTENT_TYPE);
      } catch (e) {
        console.warn(
          "[SESSION_KEY] Failed to remove persistent data from localStorage:",
          e,
        );
      }

      // Stop auto-rotation if running
      this.stopAutoRotation();

      console.log("🗑️ [SESSION_KEY] Session key cleared");
    } catch (error) {
      console.error("[SESSION_KEY] Failed to clear key:", error);
    }
  }
}

export const sessionKeyManager = new SessionKeyManager();
