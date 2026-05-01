/**
 * useSessionKey Hook
 * Initialize and manage encryption key lifecycle in React components
 * 
 * Should be called once in root layout/app to ensure key is ready
 */

import { useEffect, useState } from 'react';
import { sessionKeyManager } from '@/lib/sessionKeyManager';

export function useSessionKey() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initKey = async () => {
      try {
        console.log('🔑 [useSessionKey] Initializing session encryption key...');
        await sessionKeyManager.initialize();
        
        if (mounted) {
          setIsInitialized(true);
          console.log('✅ [useSessionKey] Session key initialized');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error initializing encryption key';
        console.error('[useSessionKey] Failed to initialize:', message);
        
        if (mounted) {
          setError(message);
          setIsInitialized(true);
        }
      }
    };

    initKey();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isInitialized,
    error,
  };
}
