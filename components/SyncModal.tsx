"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOfflineSync, SyncAction } from "@/hooks/useOfflineSync";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Link, Loader2, Trash2 } from "lucide-react";

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncModal({ isOpen, onClose }: SyncModalProps) {
  const { user } = useAuth();
  const { pendingActions, dequeueAction, incrementRetry } = useOfflineSync();
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<{
    [key: string]: "success" | "error";
  }>({});

  const handleSync = async () => {
    if (!user?.token) return;

    setSyncing(true);
    const results: { [key: string]: "success" | "error" } = {};

    for (const action of pendingActions) {
      try {
        await apiRequest(
          action.method,
          action.endpoint,
          action.payload,
          user.token,
        );
        results[action.id] = "success";
        dequeueAction(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        incrementRetry(action.id);
        results[action.id] = "error";
      }
    }

    setSyncResults(results);
    setSyncing(false);

    // Close modal after a delay if all succeeded
    const allSuccess = Object.values(results).every((r) => r === "success");
    if (allSuccess) {
      setTimeout(() => onClose(), 2000);
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
            Sync Data with Database
            <Link className="" />
          </DialogTitle>
          {pendingActions.length > 0 && (
            <DialogDescription>
              Internet connection restored! You have {pendingActions.length}{" "}
              pending actions to sync. This ensures your data is safely stored
              in the database.
            </DialogDescription>
          )}
        </DialogHeader>

        {pendingActions.length > 0 ? (
          <div className="space-y-4">
            {pendingActions.length > 0 && (
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

            <div className="flex gap-2">
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
              <Button variant="outline" onClick={onClose}>
                Later
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
