"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AlertCircle, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";

interface TrialWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  daysLeft: number;
  userId?: string;
}

export function TrialWarningDialog({
  isOpen,
  onClose,
  daysLeft,
  userId,
}: TrialWarningDialogProps) {
  const { user, updateTrialStatus } = useAuth();
  const [productKey, setProductKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleVerifyKey = async () => {
    if (!productKey.trim() || !userId) {
      setError("Please enter a valid product key");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await apiRequest(
        "POST",
        `/users/${userId}/verify-key`,
        {
          productKey: productKey.trim(),
        },
        user?.token,
      );

      if (response.ok && response.data?.user) {
        const { trial_expires, product_key_verified } = response.data.user;
        updateTrialStatus(trial_expires, product_key_verified);
        setSuccess(true);
        setProductKey("");
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(response.data?.message || "Failed to verify product key");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while verifying the key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleVerifyKey();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <DialogTitle>Trial Expiring Soon</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {daysLeft > 0 ? (
              <>
                Your trial expires in{" "}
                <span className="font-semibold text-amber-600">
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                </span>
                . Enter a product key to continue using the system after your
                trial ends.
              </>
            ) : (
              <>
                Your trial has expired. Enter a valid product key to restore
                access to your account.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm">
              ✓ Product key verified successfully! Your system access is
              restored.
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Product Key</label>
            <Input
              placeholder="Enter your product key"
              value={productKey}
              onChange={(e) => setProductKey(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || success}
              className="font-mono"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleVerifyKey}
              disabled={isLoading || !productKey.trim() || success}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : success ? (
                "✓ Verified"
              ) : (
                "Verify Key"
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
            Don't have a product key? Contact support or purchase one from our
            website.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
