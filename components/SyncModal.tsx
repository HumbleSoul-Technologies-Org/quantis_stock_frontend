import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOfflineSync, SyncAction } from "@/hooks/useOfflineSync";
import { apiRequest } from "@/lib/queryClient";
import { cleanPayloadForSync, isDuplicateKeyError } from "@/lib/errors";
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
  const { pendingActions, dequeueAction, incrementRetry } = useOfflineSync();
  const { notifyDataSync } = useNotificationActions();
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<{
    [key: string]: "success" | "error";
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

  // Helper: Get priority order for sync (suppliers → products → stock movements → sales)
  const getSyncPriority = (type: string): number => {
    if (type.includes("Supplier")) return 1;
    if (type.includes("Product")) return 2;
    if (type.includes("StockMovement")) return 3;
    if (type.includes("Sale")) return 4;
    return 5; // Other types last
  };

  // Helper: Get category name for logging
  const getCategoryName = (type: string): string => {
    if (type.includes("Supplier")) return "Suppliers";
    if (type.includes("Product")) return "Products";
    if (type.includes("StockMovement")) return "Stock Movements";
    if (type.includes("Sale")) return "Sales";
    return "Other";
  };

  // Helper: Sync a single action
  const syncSingleAction = async (
    action: SyncAction,
    results: { [key: string]: "success" | "error" },
    token: string,
  ) => {
    console.log(`📤 [SYNC MODAL] Syncing action:`, {
      id: action.id,
      type: action.type,
      endpoint: action.endpoint,
      method: action.method,
      retries: action.retries,
    });
    try {
      // Clean payload before sending to avoid E11000 errors
      const cleanedPayload = cleanPayloadForSync(action.payload, action.method);
      console.log(
        `🧹 [SYNC MODAL] Cleaned payload for ${action.method}:`,
        cleanedPayload,
      );

      console.log(
        `📡 [SYNC MODAL] Sending ${action.method} request to ${action.endpoint}`,
      );
      const response = await apiRequest(
        action.method,
        action.endpoint,
        cleanedPayload,
        token,
      );
      console.log(
        `✅ [SYNC MODAL] Success for action ${action.id}, response:`,
        response,
      );
      results[action.id] = "success";

      // Dequeue BEFORE any refetch to ensure it's marked as processed
      console.log(`📤 [SYNC MODAL] Dequeuing action ${action.id}...`);
      dequeueAction(action.id);
      console.log(`✓ [SYNC MODAL] Action ${action.id} dequeued successfully`);
    } catch (error) {
      console.error(
        `❌ [SYNC MODAL] Failed to sync action ${action.id}:`,
        error,
      );

      // Check if it's a duplicate key error (resource already exists)
      if (isDuplicateKeyError(error)) {
        console.log(
          `🔄 [SYNC MODAL] E11000 duplicate key detected - resource already synced, dequeuing...`,
        );
        results[action.id] = "success"; // Treat as successful (already in DB)
        dequeueAction(action.id);
        console.log(`✓ [SYNC MODAL] Action ${action.id} dequeued as duplicate`);
      } else {
        // Retry for non-duplicate errors
        console.log(
          `🔁 [SYNC MODAL] Incrementing retry count for action ${action.id}`,
        );
        incrementRetry(action.id);
        results[action.id] = "error";
      }
    }
  };

  const handleSync = async () => {
    if (!user?.token) return;

    console.log(
      "🔄 [SYNC MODAL] Starting prioritized sync, pending actions:",
      pendingActions.length,
    );
    setSyncing(true);
    const results: { [key: string]: "success" | "error" } = {};

    // Sort actions by priority: Suppliers → Products → Stock Movements → Sales
    const sortedActions = [...pendingActions].sort(
      (a, b) => getSyncPriority(a.type) - getSyncPriority(b.type),
    );

    // Sync by category in order
    const categories = [1, 2, 3, 4]; // Priority levels
    for (const priority of categories) {
      const categoryActions = sortedActions.filter(
        (a) => getSyncPriority(a.type) === priority,
      );

      if (categoryActions.length > 0) {
        const categoryName = getCategoryName(categoryActions[0].type);
        console.log(
          `\n📋 [SYNC MODAL] Starting sync for ${categoryName} (${categoryActions.length} actions)`,
        );

        // Sync each action in this category one by one
        for (const action of categoryActions) {
          await syncSingleAction(action, results, user.token!);
        }

        console.log(`✅ [SYNC MODAL] Completed ${categoryName} sync`);
      }
    }

    setSyncResults(results);
    setSyncing(false);

    // Send completion notifications
    const successfulCount = Object.values(results).filter(
      (r) => r === "success",
    ).length;
    const errorCount = Object.values(results).filter(
      (r) => r === "error",
    ).length;

    console.log(
      `\n🎯 [SYNC MODAL] Sync completed - ${successfulCount} successful, ${errorCount} failed`,
    );

    if (successfulCount > 0 && errorCount === 0) {
      notifyDataSync(
        `All ${successfulCount} offline actions synced (Suppliers → Products → Stock → Sales).`,
      );
      // Auto-close on success if not in background mode
      if (!backgroundSync) {
        setTimeout(() => onClose(), 2000);
      }
    } else if (errorCount > 0) {
      notifyDataSync(
        `${successfulCount} synced, ${errorCount} failed. Check details.`,
      );
    }
  };

  const successfulCount = Object.values(syncResults).filter(
    (r) => r === "success",
  ).length;
  const errorCount = Object.values(syncResults).filter(
    (r) => r === "error",
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
                  {pendingActions.map((action: SyncAction) => (
                    <li key={action.id} className="flex items-center gap-2">
                      {syncResults[action.id] === "success" && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {syncResults[action.id] === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      {action.type} -{" "}
                      {new Date(action.timestamp).toLocaleString()}
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
