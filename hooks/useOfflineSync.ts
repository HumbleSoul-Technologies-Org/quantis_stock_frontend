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
 * Uses navigator.onLine API which is reliable for most use cases
 * Avoids depending on backend endpoints that may not exist or have auth issues
 */
async function checkBackendConnectivity(): Promise<boolean> {
  // navigator.onLine is the most reliable indicator for browser connectivity
  const isOnline = navigator.onLine;
  
  if (!isOnline) {
    console.debug('🔴 Device is OFFLINE (navigator.onLine = false)');
  } else {
    console.debug('🟢 Device is ONLINE (navigator.onLine = true)');
  }
  
  return isOnline;
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
        console.warn('Offline mode is disabled. Action will not be queued:', action);
        return;
      }

      const newAction: SyncAction = {
        ...action,
        id: Math.random().toString(36).substr(2, 9),
        retries: 0,
        timestamp: new Date().toISOString(),
      };
      const updated = [...pendingActions, newAction];
      setPendingActions(updated);
      savePendingActions(updated);
    },
    [offlineMode, pendingActions, savePendingActions],
  );

  // Remove action from queue
  const dequeueAction = useCallback((id: string) => {
    const updated = pendingActions.filter(a => a.id !== id);
    setPendingActions(updated);
    savePendingActions(updated);
  }, [pendingActions, savePendingActions]);

  // Increment retry count
  const incrementRetry = useCallback((id: string) => {
    const updated = pendingActions.map(a =>
      a.id === id ? { ...a, retries: a.retries + 1 } : a
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