import { useState, useEffect, useCallback } from 'react';

export interface SyncAction {
  id: string;
  endpoint: string;
  method: string;
  payload: any;
  retries: number;
  timestamp: string;
  type: string; // e.g., 'addSale', 'updateProduct'
}

export interface SyncConfig {
  offlineMode: boolean;
  syncInterval: string;
}

const SYNC_QUEUE_KEY = 'erp_system_sync_queue';
const SYNC_QUEUE_EVENT = 'erp_system_sync_queue_updated';

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
    const response = await fetch('/api/health', { 
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

export function useOfflineSync(syncConfig?: SyncConfig) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingActions, setPendingActions] = useState<SyncAction[]>([]);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);

  const offlineMode = syncConfig?.offlineMode ?? true;
  const syncIntervalMinutes = Number(syncConfig?.syncInterval) || 15;
  const syncIntervalMs = Math.max(syncIntervalMinutes * 60000, 5000);

  // Load pending actions from localStorage
  const loadPendingActions = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading pending actions from localStorage:', error);
      return [];
    }
  }, []);

  // Save pending actions to localStorage
  const savePendingActions = useCallback((actions: SyncAction[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(actions));
      window.dispatchEvent(
        new CustomEvent(SYNC_QUEUE_EVENT, { detail: actions }),
      );
    } catch (error) {
      console.error('Error saving pending actions to localStorage:', error);
    }
  }, []);

  // Add action to queue
  const enqueueAction = useCallback(
    (action: Omit<SyncAction, 'id' | 'retries' | 'timestamp'>) => {
      if (!offlineMode) {
        console.warn('⚠️ [USEOFFLINESYNC] Offline mode disabled. Not queuing action:', action);
        return;
      }

      const newAction: SyncAction = {
        ...action,
        id: Math.random().toString(36).substr(2, 9),
        retries: 0,
        timestamp: new Date().toISOString(),
      };
      console.log('📥 [USEOFFLINESYNC] Enqueueing action:', {
        id: newAction.id,
        type: action.type,
        endpoint: action.endpoint,
        method: action.method,
        timestamp: newAction.timestamp,
      });
      const updated = [...pendingActions, newAction];
      setPendingActions(updated);
      savePendingActions(updated);
      console.log('✓ [USEOFFLINESYNC] Action enqueued. Queue size:', updated.length);
    },
    [offlineMode, pendingActions, savePendingActions],
  );

  // Remove action from queue
  const dequeueAction = useCallback((id: string) => {
    console.log('📤 [USEOFFLINESYNC] Dequeuing action:', id);
    const updated = pendingActions.filter(a => a.id !== id);
    setPendingActions(updated);
    savePendingActions(updated);
    console.log('✓ [USEOFFLINESYNC] Action dequeued. Queue size:', updated.length);
  }, [pendingActions, savePendingActions]);

  // Increment retry count
  const incrementRetry = useCallback((id: string) => {
    const action = pendingActions.find(a => a.id === id);
    const newRetryCount = (action?.retries ?? 0) + 1;
    console.log('🔁 [USEOFFLINESYNC] Incrementing retry for action:', { id, newRetryCount });
    const updated = pendingActions.map(a =>
      a.id === id ? { ...a, retries: newRetryCount } : a
    );
    setPendingActions(updated);
    savePendingActions(updated);
  }, [pendingActions, savePendingActions]);

  // Check actual backend connectivity (not just navigator.onLine)
  const verifyConnectivity = useCallback(async () => {
    // Trust navigator.onLine as the primary source of truth
    const navigatorOnline = navigator.onLine;
    
    if (!navigatorOnline) {
      setIsOnline(false);
      return false;
    }

    // If navigator says we're online, trust it
    // Only do backend checks if we want extra confidence, but don't fail on them
    const isReachable = await checkBackendConnectivity();
    setIsOnline(isReachable);

    // If we just came online and have pending actions, show sync modal
    if (isReachable && pendingActions.length > 0 && offlineMode) {
      setShowSyncModal(true);
    }

    return isReachable;
  }, [pendingActions.length, offlineMode]);

  // Check connectivity on window events and periodically
  useEffect(() => {
    const handleOnline = async () => {
      // Verify backend is reachable when online event fires
      await verifyConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Initial check
    verifyConnectivity();

    // Periodic connectivity check - uses the configured sync interval when offline sync is enabled
    const interval = offlineMode
      ? setInterval(() => {
          verifyConnectivity();
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
  }, [verifyConnectivity, offlineMode, syncIntervalMs]);

  // Load pending actions on mount
  useEffect(() => {
    setPendingActions(loadPendingActions());
  }, [loadPendingActions]);

  // Trigger sync modal on app init if we have pending actions and are online
  useEffect(() => {
    if (pendingActions.length > 0 && isOnline && offlineMode) {
      setShowSyncModal(true);
    }
  }, [pendingActions.length, isOnline, offlineMode]);

  // Sync pending actions across tabs and hook instances in the same window
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SYNC_QUEUE_KEY) {
        setPendingActions(loadPendingActions());
      }
    };

    const handleSyncQueueUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<SyncAction[]>;
      if (customEvent?.detail) {
        setPendingActions(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(SYNC_QUEUE_EVENT, handleSyncQueueUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(SYNC_QUEUE_EVENT, handleSyncQueueUpdate);
    };
  }, [loadPendingActions]);

  return {
    isOnline,
    pendingActions,
    showSyncModal,
    setShowSyncModal,
    enqueueAction,
    dequeueAction,
    incrementRetry,
    verifyConnectivity, // Export connectivity checker for error handling
  };
}