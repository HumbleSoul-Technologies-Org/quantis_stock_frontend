/**
 * useEncryptionStatus Hook
 * Monitor encryption status and handle encryption errors
 *
 * Features:
 * - Monitor encryption health
 * - Handle encryption failures gracefully
 * - Provide recovery mechanisms
 * - Track encryption status across sensitive keys
 */

import { useState, useEffect, useCallback } from 'react';
import { encryptedStorageService } from '@/lib/encryptedStorage';
import { sessionKeyManager } from '@/lib/sessionKeyManager';

interface EncryptionStatus {
  isHealthy: boolean;
  hasKey: boolean;
  cryptoAvailable: boolean;
  encryptedKeys: Record<string, { encrypted: boolean; exists: boolean }>;
  lastError: string | null;
  isRecovering: boolean;
}

export function useEncryptionStatus() {
  const [status, setStatus] = useState<EncryptionStatus>({
    isHealthy: false,
    hasKey: false,
    cryptoAvailable: false,
    encryptedKeys: {},
    lastError: null,
    isRecovering: false,
  });

  const checkStatus = useCallback(async () => {
    try {
      // Import encryption service to check availability
      const { encryptionService } = await import('@/lib/encryption');
      const cryptoAvailable = encryptionService.isAvailable();

      const encryptedKeys = encryptedStorageService.getEncryptionStatus();
      const hasKey = sessionKeyManager.isInitialized();
      const isHealthy = cryptoAvailable && hasKey && Object.values(encryptedKeys).every(k => !k.exists || k.encrypted);

      setStatus({
        isHealthy,
        hasKey,
        cryptoAvailable,
        encryptedKeys,
        lastError: null,
        isRecovering: false,
      });

      return isHealthy;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown encryption error';
      console.error('[ENCRYPTION_STATUS] Status check failed:', error);

      setStatus(prev => ({
        ...prev,
        isHealthy: false,
        cryptoAvailable: false,
        lastError: errorMessage,
        isRecovering: false,
      }));

      return false;
    }
  }, []);

  const recoverEncryption = useCallback(async () => {
    setStatus(prev => ({ ...prev, isRecovering: true, lastError: null }));

    try {
      console.log('🔧 [ENCRYPTION_STATUS] Starting encryption recovery...');

      // Clear corrupted data
      await encryptedStorageService.clearAllEncrypted();

      // Reinitialize key
      await sessionKeyManager.initialize();

      // Check status again
      await checkStatus();

      console.log('✅ [ENCRYPTION_STATUS] Encryption recovery completed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Recovery failed';
      console.error('[ENCRYPTION_STATUS] Recovery failed:', error);

      setStatus(prev => ({
        ...prev,
        isRecovering: false,
        lastError: errorMessage,
      }));
    }
  }, [checkStatus]);

  const migrateUnencryptedData = useCallback(async () => {
    try {
      console.log('🔄 [ENCRYPTION_STATUS] Migrating unencrypted data to encrypted...');

      const status = encryptedStorageService.getEncryptionStatus();
      let migratedCount = 0;

      for (const [key, keyStatus] of Object.entries(status)) {
        if (keyStatus.exists && !keyStatus.encrypted) {
          const success = await encryptedStorageService.migrateToEncrypted(key);
          if (success) migratedCount++;
        }
      }

      if (migratedCount > 0) {
        console.log(`✅ [ENCRYPTION_STATUS] Migrated ${migratedCount} keys to encrypted format`);
        await checkStatus();
      }

      return migratedCount;
    } catch (error) {
      console.error('[ENCRYPTION_STATUS] Migration failed:', error);
      throw error;
    }
  }, [checkStatus]);

  // Check status on mount and periodically
  useEffect(() => {
    checkStatus();

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    ...status,
    checkStatus,
    recoverEncryption,
    migrateUnencryptedData,
  };
}