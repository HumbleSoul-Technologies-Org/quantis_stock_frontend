/**
 * EncryptionStatusMonitor Component
 * Monitors encryption health and provides recovery options
 *
 * Features:
 * - Shows encryption status in development
 * - Provides recovery buttons for encryption issues
 * - Monitors key health and data integrity
 */

"use client";

import { useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEncryptionStatus } from "@/hooks/useEncryptionStatus";
import { toast } from "sonner";

export function EncryptionStatusMonitor() {
  const {
    isHealthy,
    hasKey,
    cryptoAvailable,
    encryptedKeys,
    lastError,
    isRecovering,
    checkStatus,
    recoverEncryption,
    migrateUnencryptedData,
  } = useEncryptionStatus();

  // Show error toast when encryption fails
  useEffect(() => {
    if (lastError && !isRecovering) {
      toast.error("Encryption Error", {
        description:
          "There was a problem with data encryption. Some features may not work properly.",
        duration: 5000,
      });
    }
  }, [lastError, isRecovering]);

  // Only show in development or when there are issues
  const shouldShow =
    process.env.NODE_ENV === "development" || !isHealthy || lastError;

  if (!shouldShow) {
    return null;
  }

  const handleMigrate = async () => {
    try {
      const count = await migrateUnencryptedData();
      if (count > 0) {
        toast.success("Migration Complete", {
          description: `Successfully migrated ${count} data items to encrypted format.`,
        });
      } else {
        toast.info("No Migration Needed", {
          description: "All data is already encrypted.",
        });
      }
    } catch (error) {
      toast.error("Migration Failed", {
        description: "Failed to migrate data to encrypted format.",
      });
    }
  };

  const handleRecover = async () => {
    try {
      await recoverEncryption();
      toast.success("Recovery Complete", {
        description: "Encryption has been recovered successfully.",
      });
    } catch (error) {
      toast.error("Recovery Failed", {
        description:
          "Failed to recover encryption. Please try clearing browser data.",
      });
    }
  };

  return (
    <div className="fixed bottom-4 hidden right-4 z-50 max-w-sm">
      <div className="dark:bg-slate-900 bg-white border border-blue-400 dark:border-teal-400 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheckIcon className="h-4 w-4 dark:text-teal-400 " />
          <span className="font-medium text-sm">Encryption Status</span>
          <Badge
            variant={isHealthy ? "default" : "destructive"}
            className="ml-auto"
          >
            {isHealthy ? (
              <>
                <CheckCircle className="h-3 text-teal-400 w-3 mr-1" />
                Healthy
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Issues
              </>
            )}
          </Badge>
        </div>

        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Session Key:</span>
            <Badge
              variant={hasKey ? "default" : "destructive"}
              className="text-xs"
            >
              {hasKey ? "Present" : "Missing"}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span>Web Crypto API:</span>
            <Badge
              variant={cryptoAvailable ? "default" : "destructive"}
              className="text-xs"
            >
              {cryptoAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span>Encrypted Keys:</span>
            <span>
              {Object.values(encryptedKeys).filter((k) => k.encrypted).length}/
              {Object.keys(encryptedKeys).length}
            </span>
          </div>

          {lastError && (
            <div className="text-red-600 bg-red-50 p-2 rounded text-xs">
              {lastError}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={checkStatus}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Check
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleMigrate}
            className="flex-1"
          >
            Migrate
          </Button>

          {/* <Button
            size="sm"
            variant="destructive"
            onClick={handleRecover}
            disabled={isRecovering}
            className="flex-1"
          >
            {isRecovering ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              "Recover"
            )}
          </Button> */}
        </div>
      </div>
    </div>
  );
}
