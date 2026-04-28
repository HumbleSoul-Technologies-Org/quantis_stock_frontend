"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WifiOff, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface NoInternetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueLocally: () => void;
  actionType: string; // e.g., "create product", "update supplier"
}

export function NoInternetModal({
  isOpen,
  onClose,
  onContinueLocally,
  actionType,
}: NoInternetModalProps) {
  const { user } = useAuth();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-orange-600" />
            Offline Mode Disabled
          </DialogTitle>
          {(user?.role === "admin" || user?.role === "manager") && (
            <DialogDescription>
              You are currently offline and offline mode is disabled in your
              settings. This action ({actionType}) will only be saved locally
              and will not sync to the database when you reconnect.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">
                Data will not be synced
              </p>
              <p className="text-orange-700 mt-1">
                Your changes will be lost if you refresh the page before
                reconnecting.{" "}
                {user?.role === "admin" || user?.role === "manager" ? (
                  <p>
                    Enable offline mode in settings to queue actions for later
                    sync.
                  </p>
                ) : (
                  <p>
                    Please contact your administrator to enable offline mode to
                    proceed without internet connectivity. This will allow you
                    to continue working and have your changes automatically
                    synced once the connection is restored.
                  </p>
                )}
              </p>
            </div>
          </div>
          {(user?.role === "admin" || user?.role === "manager") && (
            <DialogDescription>
              <p>
                Head to{" "}
                <b className="text-blue-400 underline">
                  <Link href="/dashboard/settings">Settings</Link>
                </b>{" "}
                {">"} <b>Sync Data</b> and enable offline mode to proceed
              </p>
            </DialogDescription>
          )}

          {/* <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onContinueLocally} className="flex-1">
              Continue Locally
            </Button>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
