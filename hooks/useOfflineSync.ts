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

const SYNC_QUEUE_KEY = 'erp_system_sync_queue';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingActions, setPendingActions] = useState<SyncAction[]>([]);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);

  // Load pending actions from localStorage
  const loadPendingActions = useCallback(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  // Save pending actions to localStorage
  const savePendingActions = useCallback((actions: SyncAction[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(actions));
  }, []);

  // Add action to queue
  const enqueueAction = useCallback((action: Omit<SyncAction, 'id' | 'retries' | 'timestamp'>) => {
    const newAction: SyncAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      retries: 0,
      timestamp: new Date().toISOString(),
    };
    const updated = [...pendingActions, newAction];
    setPendingActions(updated);
    savePendingActions(updated);
  }, [pendingActions, savePendingActions]);

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

  // Check connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show sync modal if there are pending actions
      if (pendingActions.length > 0) {
        setShowSyncModal(true);
      }
    };
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActions.length]);

  // Load pending actions on mount
  useEffect(() => {
    setPendingActions(loadPendingActions());
  }, [loadPendingActions]);

  return {
    isOnline,
    pendingActions,
    showSyncModal,
    setShowSyncModal,
    enqueueAction,
    dequeueAction,
    incrementRetry,
  };
}