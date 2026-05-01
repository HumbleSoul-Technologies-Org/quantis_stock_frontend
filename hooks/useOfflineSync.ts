import { useState, useEffect, useCallback } from 'react';
import { addOperation, deleteOperation, getOperationById, getPendingOperations, updateOperation } from '@/lib/offline/db';
import { syncQueue, processOperation } from '@/lib/offline/sync-engine';
import { Operation } from '@/lib/offline/types';
import { API_BASE_URL } from '@/lib/config';
import { getUserSession } from '@/lib/authStorage';
import { storage } from '@/lib/storage';

export interface SyncConfig {
  offlineMode: boolean;
  syncInterval: string;
}

const SYNC_QUEUE_EVENT = 'erp_system_sync_queue_updated';

async function getEffectiveToken(token?: string): Promise<string | undefined> {
  if (token) {
    return token;
  }

  try {
    const storedUser = await getUserSession();
    if (storedUser?.token) {
      console.log('🔁 [USEOFFLINESYNC] Using fallback token from stored session');
      return storedUser.token;
    }
  } catch (error) {
    console.error('🔁 [USEOFFLINESYNC] Error getting stored user session:', error);
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

  // Count actual offline items in localStorage
  const countOfflineItems = useCallback((): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const offlineItems = storage.getOfflineItems();
      const count = (offlineItems.products?.length || 0) +
                    (offlineItems.suppliers?.length || 0) +
                    (offlineItems.sales?.length || 0) +
                    (offlineItems.saleReturns?.length || 0) +
                    (offlineItems.stockMovements?.length || 0);
      return count;
    } catch (error) {
      console.error('Error counting offline items:', error);
      return 0;
    }
  }, []);

  const loadPendingActions = useCallback(async (): Promise<Operation[]> => {
    if (typeof window === 'undefined') return [];
    try {
      // Return array with dummy operations matching the offline item count
      // This is used by the UI to display pending count
      const count = countOfflineItems();
      return Array(count).fill(null).map((_, i) => ({
        id: `offline-item-${i}`,
        type: 'OFFLINE_ITEM' as any,
        payload: {},
        status: 'pending',
        retries: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
    } catch (error) {
      console.error('Error loading pending actions:', error);
      return [];
    }
  }, [countOfflineItems]);

  const syncPendingActions = useCallback(
    async (): Promise<Record<string, 'success' | 'failed'>> => {
      const effectiveToken = await getEffectiveToken(authToken);
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
          const updated = await loadPendingActions();
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
    [authToken, dispatchQueueUpdate, loadPendingActions],
  );

  const enqueueAction = useCallback(
    async (action: Omit<Operation, 'id' | 'status' | 'retries' | 'createdAt' | 'updatedAt'>) => {
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

          const effectiveToken = await getEffectiveToken(authToken);
          if (effectiveToken) {
            try {
              await processOperation(operation, effectiveToken);
              console.log('✅ [USEOFFLINESYNC] Operation processed successfully', { id: operation.id });
            } catch (error) {
              console.error('❌ [USEOFFLINESYNC] Failed to process operation immediately', {
                id: operation.id,
                error: error instanceof Error ? error.message : String(error)
              });
              // Only queue if offline mode is enabled
              if (offlineMode) {
                console.log('📥 [USEOFFLINESYNC] Offline mode enabled - queuing failed operation');
                await addOperation(operation);
                const updated = await loadPendingActions();
                setPendingActions(updated);
                dispatchQueueUpdate(updated);
              } else {
                // Offline mode disabled - throw error instead of queuing
                console.log('❌ [USEOFFLINESYNC] Offline mode disabled - throwing error instead of queuing');
                throw error;
              }
            }
          } else {
            console.warn('⚠️ [USEOFFLINESYNC] No auth token available for immediate processing', { id: operation.id });
            if (offlineMode) {
              console.log('📥 [USEOFFLINESYNC] Offline mode enabled - queuing operation without token');
              await addOperation(operation);
              const updated = await loadPendingActions();
              setPendingActions(updated);
              dispatchQueueUpdate(updated);
            } else {
              throw new Error('No auth token available and offline mode is disabled');
            }
          }
          return;
        }

        // If offline, queue for later sync (only if offline mode is enabled)
        if (!offlineMode) {
          console.warn('⚠️ [USEOFFLINESYNC] Device is OFFLINE and offline mode is disabled. Cannot queue action:', action);
          throw new Error('Device is offline and offline sync is not enabled');
        }

        console.log('📥 [USEOFFLINESYNC] Device is OFFLINE - enqueueing operation:', {
          id: operation.id,
          type: operation.type,
          endpoint: operation.endpoint,
          method: operation.method,
        });

        await addOperation(operation);

        const updated = await loadPendingActions();
        setPendingActions(updated);
        dispatchQueueUpdate(updated);
        console.log('✓ [USEOFFLINESYNC] Operation enqueued. Queue size:', updated.length);
      } catch (error) {
        console.error('❌ [USEOFFLINESYNC] Error in enqueueAction', { id: operation.id, error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    },
    [offlineMode, isOnline, authToken, dispatchQueueUpdate, loadPendingActions],
  );

  const incrementRetry = useCallback(
    async (id: string) => {
      const existing = await getOperationById(id);
      const newRetryCount = (existing?.retries ?? 0) + 1;
      console.log('🔁 [USEOFFLINESYNC] Incrementing retry for action:', { id, newRetryCount });

      await updateOperation(id, { retries: newRetryCount, updatedAt: Date.now() });
      const updated = await loadPendingActions();
      setPendingActions(updated);
      dispatchQueueUpdate(updated);
    },
    [dispatchQueueUpdate, loadPendingActions],
  );

  const dequeueAction = useCallback(
    async (id: string) => {
      console.log('📤 [USEOFFLINESYNC] Dequeuing action:', id);
      await deleteOperation(id);
      const updated = await loadPendingActions();
      setPendingActions(updated);
      dispatchQueueUpdate(updated);
      console.log('✓ [USEOFFLINESYNC] Action dequeued. Queue size:', updated.length);
    },
    [dispatchQueueUpdate, loadPendingActions],
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
        const effectiveToken = await getEffectiveToken(authToken);
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