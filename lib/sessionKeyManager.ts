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

const SESSION_KEY_STORAGE = '__encryption_key__';
const SESSION_KEY_METADATA = '__encryption_key_metadata__';

// Lazy-loaded service to prevent SSR issues
let encryptionService: any = null;

function getEncryptionService() {
  if (typeof window === 'undefined') {
    throw new Error('SessionKeyManager requires browser environment');
  }
  if (!encryptionService) {
    const { encryptionService: service } = require('./encryption');
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
    if (typeof window === 'undefined') {
      throw new Error('SessionKeyManager requires browser environment');
    }

    const encryption = getEncryptionService();
    if (!encryption.isAvailable()) {
      console.warn('[SESSION_KEY] Web Crypto API not available - skipping key initialization');
      this.initialized = true;
      return;
    }

    try {
      // Check if key already exists in sessionStorage
      const storedKey = sessionStorage.getItem(SESSION_KEY_STORAGE);
      const storedMetadata = sessionStorage.getItem(SESSION_KEY_METADATA);

      if (storedKey && storedMetadata) {
        console.log('🔑 [SESSION_KEY] Recovering existing session key from sessionStorage');
        this.currentKey = await encryption.importKey(storedKey);
        this.metadata = JSON.parse(storedMetadata);
        
        // Check if rotation is needed
        if (this.shouldRotate()) {
          console.log('🔄 [SESSION_KEY] Key rotation time exceeded - generating new key');
          await this.rotateKey();
        }
        
        return;
      }

      // No existing key - generate new one
      console.log('🔐 [SESSION_KEY] Generating new session encryption key');
      await this.createNewKey();
    } catch (error) {
      console.error('[SESSION_KEY] Failed to initialize key:', error);
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
      throw new Error('Web Crypto API not available');
    }

    if (this.currentKey) {
      // Check if rotation is needed
      if (this.shouldRotate()) {
        console.log('🔄 [SESSION_KEY] Key rotation time exceeded - generating new key');
        await this.rotateKey();
      }
      
      return this.currentKey;
    }

    throw new Error('Session key is not initialized');
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
    console.log('🔄 [SESSION_KEY] Rotating encryption key');
    return await this.createNewKey();
  }

  /**
   * Clear session key (on logout)
   */
  lockKey(): void {
    console.log('🔒 [SESSION_KEY] Locking session key (clearing from memory and storage)');
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
   * Private: Create new key and store it
   */
  private async createNewKey(): Promise<CryptoKey> {
    const encryption = getEncryptionService();
    if (!encryption.isAvailable()) {
      throw new Error('Web Crypto API not available');
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
      sessionStorage.setItem(SESSION_KEY_METADATA, JSON.stringify(this.metadata));

      this.currentKey = newKey;

      console.log('✅ [SESSION_KEY] New session key created and stored', {
        sessionId: this.metadata.sessionId,
        rotationCount: this.metadata.rotationCount,
      });

      return newKey;
    } catch (error) {
      console.error('[SESSION_KEY] Failed to create new key:', error);
      throw new Error(`Failed to create session key: ${error instanceof Error ? error.message : 'unknown error'}`);
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
      console.warn('[SESSION_KEY] Auto-rotation already started');
      return;
    }

    this.keyRotationInterval = setInterval(async () => {
      try {
        console.log('🔄 [SESSION_KEY] Auto-rotating key (scheduled)');
        await this.rotateKey();
      } catch (error) {
        console.error('[SESSION_KEY] Auto-rotation failed:', error);
      }
    }, this.KEY_ROTATION_TIME);

    console.log('✅ [SESSION_KEY] Auto-rotation started (1 hour interval)');
  }

  /**
   * Stop automatic key rotation
   */
  stopAutoRotation(): void {
    if (this.keyRotationInterval) {
      clearInterval(this.keyRotationInterval);
      this.keyRotationInterval = null;
      console.log('⏹️ [SESSION_KEY] Auto-rotation stopped');
    }
  }

  /**
   * Clear session key (for logout or security)
   * Removes key from memory and sessionStorage
   */
  clearKey(): void {
    if (typeof window === 'undefined') return;

    try {
      // Clear in-memory key
      this.currentKey = null;
      this.metadata = null;

      // Clear from sessionStorage
      sessionStorage.removeItem(SESSION_KEY_STORAGE);
      sessionStorage.removeItem(SESSION_KEY_METADATA);

      // Stop auto-rotation if running
      this.stopAutoRotation();

      console.log('🗑️ [SESSION_KEY] Session key cleared');
    } catch (error) {
      console.error('[SESSION_KEY] Failed to clear key:', error);
    }
  }
}

export const sessionKeyManager = new SessionKeyManager();
