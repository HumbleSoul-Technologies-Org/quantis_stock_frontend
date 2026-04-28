import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Operation } from "@/lib/offline/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle,
  Link,
  Loader2,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNotificationActions } from "@/hooks/useNotificationActions";

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoStartSync?: boolean;
}

export function SyncModal({
  isOpen,
  onClose,
  autoStartSync = false,
}: SyncModalProps) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { pendingActions, dequeueAction, syncPendingActions } = useOfflineSync(
    settings?.syncData,
    user?.token,
  );
  const { notifyDataSync } = useNotificationActions();
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<{
    [key: string]: "success" | "failed";
  }>({});
  const [backgroundSync, setBackgroundSync] = useState(false);

  // Auto-start sync when modal opens with autoStartSync=true
  useEffect(() => {
    if (
      isOpen &&
      autoStartSync &&
      pendingActions.length > 0 &&
      !syncing &&
      !backgroundSync
    ) {
      handleSync();
    }
  }, [isOpen, autoStartSync, pendingActions.length, syncing, backgroundSync]);

  // Clear sync state when modal closes to prevent stale data on reopen
  useEffect(() => {
    if (!isOpen) {
      setSyncResults({});
      setBackgroundSync(false);
    }
  }, [isOpen]);

  const handleSync = async () => {
    if (!user?.token || !syncPendingActions) {
      console.error("🚨 [SYNC MODAL] Cannot start sync", {
        hasToken: !!user?.token,
        hasSyncFunction: !!syncPendingActions,
      });
      return;
    }

    const syncStartTime = performance.now();
    console.log("🔄 [SYNC MODAL] Starting sync", {
      count: pendingActions.length,
      types: pendingActions.map((a: Operation) => a.type),
    });
    setSyncing(true);

    try {
      const results = await syncPendingActions();
      setSyncResults(results);

      const successfulCount = Object.values(results).filter(
        (r) => r === "success",
      ).length;
      const errorCount = Object.values(results).filter(
        (r) => r === "failed",
      ).length;

      console.log("🎯 [SYNC MODAL] Sync completed", {
        successful: successfulCount,
        failed: errorCount,
        durationSec: ((performance.now() - syncStartTime) / 1000).toFixed(2),
      });

      if (errorCount > 0) {
        console.error(
          "❌ [SYNC MODAL] Failed ops:",
          pendingActions
            .filter((a: Operation) => results[a.id] === "failed")
            .map((a: Operation) => ({
              id: a.id,
              type: a.type,
              retries: a.retries,
            })),
        );
      }

      if (successfulCount > 0 && errorCount === 0) {
        notifyDataSync(
          `All ${successfulCount} offline actions synced successfully.`,
        );
        if (!backgroundSync) {
          setTimeout(() => onClose(), 2000);
        }
      } else if (errorCount > 0) {
        notifyDataSync(
          `${successfulCount} synced, ${errorCount} failed. Check console.`,
        );
      }
    } catch (error) {
      console.error("🚨 [SYNC MODAL] Sync error", {
        msg: error instanceof Error ? error.message : String(error),
      });
      notifyDataSync(
        `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setSyncing(false);
    }
  };

  const successfulCount = Object.values(syncResults).filter(
    (r) => r === "success",
  ).length;
  const errorCount = Object.values(syncResults).filter(
    (r) => r === "failed",
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            {autoStartSync ? "Auto-Syncing Data" : "Sync Data with Database"}
            <Link className="" />
          </DialogTitle>
          {pendingActions.length > 0 && (
            <DialogDescription>
              {autoStartSync
                ? "Your offline data is being synced automatically. Please wait..."
                : "Internet connection restored! You have " +
                  pendingActions.length +
                  " pending actions to sync. This ensures your data is safely stored in the database."}
            </DialogDescription>
          )}
        </DialogHeader>

        {pendingActions.length > 0 ? (
          <div className="space-y-4">
            {syncing && autoStartSync && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Syncing actions...</span>
                  <span>
                    {Object.keys(syncResults).length} of {pendingActions.length}
                  </span>
                </div>
                <Progress
                  value={
                    (Object.keys(syncResults).length / pendingActions.length) *
                    100
                  }
                  className="w-full"
                />
              </div>
            )}

            {pendingActions.length > 0 && !syncing && (
              <div className="space-y-2">
                <h4 className="font-medium">Pending Actions:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pendingActions.map((action: Operation) => (
                    <li key={action.id} className="flex items-center gap-2">
                      {syncResults[action.id] === "success" && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {syncResults[action.id] === "failed" && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      {action.type} -{" "}
                      {new Date(action.createdAt).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Object.keys(syncResults).length > 0 && (
              <div className="text-sm">
                <p className="text-green-600">
                  ✓ {successfulCount} synced successfully
                </p>
                {errorCount > 0 && (
                  <p className="text-red-600">
                    ✗ {errorCount} failed (will retry later)
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {autoStartSync && syncing ? (
                <Button
                  onClick={() => setBackgroundSync(true)}
                  variant="outline"
                  className="flex-1"
                >
                  Sync in Background
                </Button>
              ) : (
                <Button
                  onClick={handleSync}
                  disabled={syncing || pendingActions.length === 0}
                  className="flex-1"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    "Sync Now"
                  )}
                </Button>
              )}

              {errorCount > 0 && !syncing && (
                <Button
                  onClick={handleSync}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Failed
                </Button>
              )}

              <Button variant="outline" onClick={onClose}>
                {autoStartSync ? "Hide" : "Later"}
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  pendingActions.forEach((a) => dequeueAction(a.id))
                }
              >
                <Trash2 className="w-4 h-4" />
                Clear Pending Actions
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium">All data is up to date!</h3>
            <p className="text-sm text-gray-600 mt-1">
              No pending actions to sync. Your data is safely stored in the
              database.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
