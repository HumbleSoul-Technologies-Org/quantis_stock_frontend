import { useState, useEffect, useCallback } from 'react';
import { addOperation, deleteOperation, getOperationById, getPendingOperations, updateOperation } from '@/lib/offline/db';
import { syncQueue, processOperation } from '@/lib/offline/sync-engine';
import { Operation } from '@/lib/offline/types';
import { API_BASE_URL } from '@/lib/config';
import { getUserSession } from '@/lib/authStorage';

export interface SyncConfig {
  offlineMode: boolean;
  syncInterval: string;
}

const SYNC_QUEUE_EVENT = 'erp_system_sync_queue_updated';

function getEffectiveToken(token?: string): string | undefined {
  if (token) {
    return token;
  }

  const storedUser = getUserSession();
  if (storedUser?.token) {
    console.log('🔁 [USEOFFLINESYNC] Using fallback token from stored session');
    return storedUser.token;
  }

  return undefined;
}

/**
 * Check if device has internet connectivity
 * Uses multiple signals: navigator.onLine + attempt to fetch a lightweight resource
 * Falls back safely if fetch fails
 */
async function checkBackendConnectivity(): Promise<boolean> {
  // Primary check: navigator.onLine
  const navigatorOnline = navigator.onLine;
  
  if (!navigatorOnline) {
    console.debug('🔴 Device is OFFLINE (navigator.onLine = false)');
    return false;
  }

  // Secondary check: Try a lightweight fetch to verify actual connectivity
  // Use a HEAD request to a simple endpoint to detect network issues
  try {

    
    console.debug('🔍 [CONNECTIVITY] navigator.onLine = true, verifying with fetch...');
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    
    if (response.ok) {
      console.debug('🟢 Device is ONLINE (fetch successful)');
      return true;
    } else {
      console.debug('🟡 Device connectivity uncertain (fetch returned ' + response.status + ')');
      // If server returns an error but fetch succeeds, we're online but server has issues
      // Still consider it online for sync purposes
      return true;
    }
  } catch (fetchError: any) {
    const isTimeout = fetchError?.name === 'AbortError';
    if (isTimeout) {
      console.debug('🟡 Connectivity check timed out, assuming OFFLINE');
      return false;
    }
    
    console.debug('🔴 Fetch check failed:', fetchError?.message);
    // Fetch failed = network error, trust navigator.onLine as fallback
    return navigatorOnline;
  }
}

export function useOfflineSync(syncConfig?: SyncConfig, authToken?: string) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingActions, setPendingActions] = useState<Operation[]>([]);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);

  const offlineMode = syncConfig?.offlineMode ?? true;
  const syncIntervalMinutes = Number(syncConfig?.syncInterval) || 15;
  const syncIntervalMs = Math.max(syncIntervalMinutes * 60000, 5000);

  const dispatchQueueUpdate = useCallback((actions: Operation[]) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(SYNC_QUEUE_EVENT, { detail: actions }));
  }, []);

  const loadPendingActions = useCallback(async (): Promise<Operation[]> => {
    if (typeof window === 'undefined') return [];
    try {
      return await getPendingOperations();
    } catch (error) {
      console.error('Error loading pending actions from IndexedDB:', error);
      return [];
    }
  }, []);

  const syncPendingActions = useCallback(
    async (): Promise<Record<string, 'success' | 'failed'>> => {
      const effectiveToken = getEffectiveToken(authToken);
      console.log("🔐 [useOfflineSync] syncPendingActions called", {
        hasToken: !!effectiveToken,
        tokenPreview: effectiveToken ? effectiveToken.substring(0, 20) + '...' : 'MISSING',
        authTokenValue: effectiveToken,
      });

      if (!effectiveToken) {
        console.error("🚨 [useOfflineSync] CRITICAL: Cannot sync - no auth token", {
          authTokenIsUndefined: authToken === undefined,
          authTokenIsNull: authToken === null,
          authTokenIsEmpty: authToken === '',
        });
        return {};
      }

      try {
        console.log("📤 [useOfflineSync] Starting sync with token", {
          tokenLength: effectiveToken.length,
        });
        const results = await syncQueue(effectiveToken);
        
        try {
          const updated = await getPendingOperations();
          setPendingActions(updated);
          dispatchQueueUpdate(updated);
        } catch (stateError) {
          console.error("❌ [useOfflineSync] Failed to update state after sync", { error: stateError instanceof Error ? stateError.message : String(stateError) });
        }
        
        return results;
      } catch (error) {
        console.error("❌ [useOfflineSync] syncQueue threw error", { error: error instanceof Error ? error.message : String(error) });
        return {};
      }
    },
    [authToken, dispatchQueueUpdate],
  );

  const enqueueAction = useCallback(
    async (action: Omit<Operation, 'id' | 'status' | 'retries' | 'createdAt' | 'updatedAt'>) => {
      if (!offlineMode) {
        console.warn('⚠️ [USEOFFLINESYNC] Offline mode disabled. Not queuing action:', action);
        return;
      }

      const operation: Operation = {
        ...action,
        id: crypto.randomUUID?.() ?? Math.random().toString(36).substr(2, 9),
        status: 'pending',
        retries: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      try {
        // If online, process immediately instead of queueing
        if (isOnline) {
          console.log('🟢 [USEOFFLINESYNC] Device is ONLINE - processing operation immediately', {
            id: operation.id,
            type: operation.type,
            endpoint: operation.endpoint,
          });

          const effectiveToken = getEffectiveToken(authToken);
          if (effectiveToken) {
            try {
              await processOperation(operation, effectiveToken);
              console.log('✅ [USEOFFLINESYNC] Operation processed successfully', { id: operation.id });
            } catch (error) {
              console.error('❌ [USEOFFLINESYNC] Failed to process operation immediately', {
                id: operation.id,
                error: error instanceof Error ? error.message : String(error)
              });
              // If immediate processing fails, fall back to queuing
              await addOperation(operation);
              const updated = await getPendingOperations();
              setPendingActions(updated);
              dispatchQueueUpdate(updated);
            }
          } else {
            console.warn('⚠️ [USEOFFLINESYNC] No auth token available for immediate processing, queuing instead', { id: operation.id });
            await addOperation(operation);
            const updated = await getPendingOperations();
            setPendingActions(updated);
            dispatchQueueUpdate(updated);
          }
          return;
        }

        // If offline, queue for later sync
        console.log('📥 [USEOFFLINESYNC] Device is OFFLINE - enqueueing operation:', {
          id: operation.id,
          type: operation.type,
          endpoint: operation.endpoint,
          method: operation.method,
        });

        await addOperation(operation);

        const updated = await getPendingOperations();
        setPendingActions(updated);
        dispatchQueueUpdate(updated);
        console.log('✓ [USEOFFLINESYNC] Operation enqueued. Queue size:', updated.length);
      } catch (error) {
        console.error('❌ [USEOFFLINESYNC] Failed to enqueue operation', { id: operation.id, error: error instanceof Error ? error.message : String(error) });
      }
    },
    [offlineMode, isOnline, authToken, dispatchQueueUpdate],
  );

  const incrementRetry = useCallback(
    async (id: string) => {
      const existing = await getOperationById(id);
      const newRetryCount = (existing?.retries ?? 0) + 1;
      console.log('🔁 [USEOFFLINESYNC] Incrementing retry for action:', { id, newRetryCount });

      await updateOperation(id, { retries: newRetryCount, updatedAt: Date.now() });
      const updated = await getPendingOperations();
      setPendingActions(updated);
      dispatchQueueUpdate(updated);
    },
    [dispatchQueueUpdate],
  );

  const dequeueAction = useCallback(
    async (id: string) => {
      console.log('📤 [USEOFFLINESYNC] Dequeuing action:', id);
      await deleteOperation(id);
      const updated = await getPendingOperations();
      setPendingActions(updated);
      dispatchQueueUpdate(updated);
      console.log('✓ [USEOFFLINESYNC] Action dequeued. Queue size:', updated.length);
    },
    [dispatchQueueUpdate],
  );

  const verifyConnectivity = useCallback(async () => {
    try {
      const navigatorOnline = navigator.onLine;

      if (!navigatorOnline) {
        console.log("📡 [useOfflineSync] navigator.onLine = false");
        setIsOnline(false);
        return false;
      }

      console.log("📡 [useOfflineSync] Checking backend connectivity...");
      const isReachable = await checkBackendConnectivity();
      setIsOnline(isReachable);

      if (isReachable && pendingActions.length > 0 && offlineMode) {
        console.log("🔄 [useOfflineSync] Backend reachable with pending actions - showing sync modal");
        setShowSyncModal(true);
        const effectiveToken = getEffectiveToken(authToken);
        if (effectiveToken) {
          console.log("🔄 [useOfflineSync] Starting auto-sync");
          await syncPendingActions();
        }
      }

      return isReachable;
    } catch (error) {
      console.error("❌ [useOfflineSync] verifyConnectivity error", { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }, [pendingActions.length, offlineMode, authToken, syncPendingActions]);

  // Check connectivity on window events and periodically
  useEffect(() => {
    const handleOnline = async () => {
      try {
        console.log("🟢 [useOfflineSync] 'online' event triggered");
        const isReachable = await verifyConnectivity();
        if (isReachable && authToken) {
          console.log("🔄 [useOfflineSync] Syncing after 'online' event");
          await syncPendingActions();
        }
      } catch (error) {
        console.error("❌ [useOfflineSync] Error in handleOnline", { error: error instanceof Error ? error.message : String(error) });
      }
    };

    const handleOffline = () => {
      try {
        console.log("🔴 [useOfflineSync] 'offline' event triggered");
        setIsOnline(false);
      } catch (error) {
        console.error("❌ [useOfflineSync] Error in handleOffline", { error: error instanceof Error ? error.message : String(error) });
      }
    };

    try {
      console.log("🔌 [useOfflineSync] Initial connectivity check on mount");
      verifyConnectivity();
    } catch (error) {
      console.error("❌ [useOfflineSync] Error in initial connectivity check", { error: error instanceof Error ? error.message : String(error) });
    }

    const interval = offlineMode
      ? setInterval(() => {
          try {
            verifyConnectivity();
          } catch (error) {
            console.error("❌ [useOfflineSync] Error in interval connectivity check", { error: error instanceof Error ? error.message : String(error) });
          }
        }, syncIntervalMs)
      : null;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [verifyConnectivity, offlineMode, syncIntervalMs, authToken, syncPendingActions]);

  // Load pending actions on mount
  useEffect(() => {
    (async () => {
      setPendingActions(await loadPendingActions());
    })();
  }, [loadPendingActions]);

  // Trigger sync modal on app init if we have pending actions and are online
  useEffect(() => {
    if (pendingActions.length > 0 && isOnline && offlineMode) {
      setShowSyncModal(true);
    }
  }, [pendingActions.length, isOnline, offlineMode]);

  // Sync pending actions across hook instances in the same window
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSyncQueueUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Operation[]>;
      if (customEvent?.detail) {
        setPendingActions(customEvent.detail);
      }
    };

    window.addEventListener(SYNC_QUEUE_EVENT, handleSyncQueueUpdate);

    return () => {
      window.removeEventListener(SYNC_QUEUE_EVENT, handleSyncQueueUpdate);
    };
  }, []);

  return {
    isOnline,
    pendingActions,
    showSyncModal,
    setShowSyncModal,
    enqueueAction,
    dequeueAction,
    incrementRetry,
    syncPendingActions,
    verifyConnectivity, // Export connectivity checker for error handling
  };
}