"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  AlertCircle,
  Clock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

// Auto-logout timeout options (in milliseconds)
const AUTO_LOGOUT_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 60000, label: "60 seconds" },
  { value: 300000, label: "5 minutes" },
  { value: 600000, label: "10 minutes" },
  { value: 900000, label: "15 minutes" },
  { value: 1800000, label: "30 minutes" },
  { value: 3600000, label: "1 hour" },
];

export function Security() {
  const { user, updateCredentials } = useAuth();
  const { settings, updateSecurity } = useSettings();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [autoLogoutTimeout, setAutoLogoutTimeout] = useState<number>(0);
  const [isUpdatingTimeout, setIsUpdatingTimeout] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(5);

  const isAdmin = user?.role === "admin";

  // Initialize auto-logout timeout from settings
  useEffect(() => {
    if (settings?.security?.autoLogoutTimeout !== undefined) {
      setAutoLogoutTimeout(settings.security.autoLogoutTimeout);
    }
  }, [settings?.security?.autoLogoutTimeout]);

  const handleAutoLogoutChange = async (value: string) => {
    const timeoutValue = parseInt(value, 10);
    setAutoLogoutTimeout(timeoutValue);
    setIsUpdatingTimeout(true);

    try {
      const success = await updateSecurity({
        autoLogoutTimeout: timeoutValue,
      });

      if (success) {
        const option = AUTO_LOGOUT_OPTIONS.find(
          (o) => o.value === timeoutValue,
        );
        toast.success(
          `Auto-logout timeout set to ${option?.label || "disabled"}`,
        );
      } else {
        toast.error("Failed to update auto-logout timeout");
        // Revert on failure
        setAutoLogoutTimeout(settings?.security?.autoLogoutTimeout ?? 0);
      }
    } catch (error) {
      toast.error("Failed to update auto-logout timeout");
      setAutoLogoutTimeout(settings?.security?.autoLogoutTimeout ?? 0);
    } finally {
      setIsUpdatingTimeout(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newUsername?.trim()) {
      newErrors.newUsername = "New username is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    }

    if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      const success = await updateCredentials(
        formData.newUsername,
        formData.newPassword,
        formData.currentPassword,
      );

      if (success) {
        toast.success("Credentials updated successfully");
        setMessage({
          type: "success",
          text: "Credentials updated successfully!",
        });
        setFormData({
          currentPassword: "",
          newUsername: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: "Current password is incorrect",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Update failed",
      });
    }
  };

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountingDown && countdownValue > 0) {
      timer = setTimeout(() => {
        setCountdownValue(countdownValue - 1);
      }, 1000);
    } else if (isCountingDown && countdownValue === 0) {
      // Trigger the actual deletion when countdown reaches 0
      performDeletion();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCountingDown, countdownValue]);

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Password is required");
      return;
    }

    // Start countdown instead of immediate deletion
    setIsCountingDown(true);
    setCountdownValue(5);
  };

  const performDeletion = async () => {
    try {
      setIsDeleting(true);
      setDeleteError("");

      const res = await apiRequest(
        "DELETE",
        `/settings/account/delete/${user?.businessId}`,
        { password: deletePassword },
        user?.token,
      );

      if (!res.ok) {
        const text = await res.text();
        setDeleteError(text || "Failed to delete account");
        return;
      }

      toast.success("Business account deleted successfully");
      localStorage.clear();
      setShowDeleteDialog(false);
      setDeletePassword("");
      // Redirect to login or home page
      window.location.href = "/auth/login";
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete account",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeletion = () => {
    setIsCountingDown(false);
    setCountdownValue(5);
  };

  const getCountdownColor = (value: number) => {
    switch (value) {
      case 5:
        return "text-green-600 dark:text-green-500";
      case 4:
        return "text-yellow-600 dark:text-yellow-500";
      case 3:
        return "text-yellow-500 dark:text-yellow-400";
      case 2:
        return "text-orange-500 dark:text-orange-400";
      case 1:
        return "text-orange-600 dark:text-orange-500";
      case 0:
        return "text-red-600 dark:text-red-500";
      default:
        return "text-red-600 dark:text-red-500";
    }
  };

  const getProgressBarColor = (value: number) => {
    switch (value) {
      case 5:
        return "bg-gradient-to-r from-green-500 to-green-600";
      case 4:
        return "bg-gradient-to-r from-yellow-400 to-green-500";
      case 3:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-orange-400 to-yellow-500";
      case 1:
        return "bg-gradient-to-r from-orange-500 to-orange-600";
      case 0:
        return "bg-gradient-to-r from-red-500 to-red-600";
      default:
        return "bg-gradient-to-r from-red-500 to-red-600";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-teal-100">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAdmin && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 flex gap-2 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                Only admins can change credentials. Contact your admin to change
                credentials.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Current Password *
              </label>
              <Input
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                placeholder="Enter your current password"
                className={
                  errors.currentPassword
                    ? "border-red-500"
                    : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
                }
                disabled={!isAdmin}
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                New Username *
              </label>
              <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">
                Current username:{" "}
                <strong className="dark:text-teal-100">{user?.username}</strong>
              </div>
              <Input
                type="text"
                value={formData.newUsername}
                onChange={(e) =>
                  setFormData({ ...formData, newUsername: e.target.value })
                }
                placeholder="Enter new username"
                className={
                  errors.newUsername
                    ? "border-red-500"
                    : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
                }
                disabled={!isAdmin}
              />
              {errors.newUsername && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newUsername}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                New Password *
              </label>
              <Input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                placeholder="Enter new password"
                className={
                  errors.newPassword
                    ? "border-red-500"
                    : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
                }
                disabled={!isAdmin}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Confirm Password *
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Confirm new password"
                className={
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
                }
                disabled={!isAdmin}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isAdmin}
              className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
            >
              Update Credentials
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-teal-700">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Security Tips:
            </p>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
              <li>• Use a strong password with mixed characters</li>
              <li>
                • Keep your credentials secure and don't share with others
              </li>
              <li>• Change your password regularly for better security</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Logout Settings */}
      <Card className="border-purple-200 border-2 dark:bg-slate-800 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-purple-100">
            <Clock className="w-5 h-5" />
            Session Timeout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">🔒 Auto-Logout</p>
            <p>
              Automatically log out inactive sessions after a specified period
              of inactivity to enhance security. Select a timeout interval or
              disable this feature.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Inactivity Timeout
            </label>
            <Select
              value={autoLogoutTimeout.toString()}
              onValueChange={handleAutoLogoutChange}
              disabled={isUpdatingTimeout}
            >
              <SelectTrigger className="border-purple-200 dark:border-purple-700 dark:bg-slate-700 dark:text-slate-50">
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                {AUTO_LOGOUT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
              {autoLogoutTimeout === 0
                ? "Auto-logout is currently disabled."
                : `You will be automatically logged out after ${AUTO_LOGOUT_OPTIONS.find((o) => o.value === autoLogoutTimeout)?.label.toLowerCase() || "inactivity"}.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card className="border-blue-200 border-2 dark:bg-slate-800 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-teal-100">
            <Clock className="w-5 h-5" />
            Security Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">
              Security logs will be displayed here.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">
              Recent login attempts, password changes, and security events.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 border-2 dark:bg-slate-800 dark:border-red-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-red-100">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
            <p className="font-medium mb-1">⚠️ Warning</p>
            <p>
              Deleting your business account is permanent and cannot be undone.
              All data including users, products, inventory, sales records, and
              settings will be permanently deleted from our servers.
            </p>
          </div>

          <Button
            onClick={() => setShowDeleteDialog(true)}
            disabled={!isAdmin}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Business Account
          </Button>

          {!isAdmin && (
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Only admins can delete the business account.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) {
            setDeletePassword("");
            setDeleteError("");
            setIsCountingDown(false);
            setCountdownValue(5);
          }
        }}
      >
        <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-red-700">
          <DialogHeader>
            <DialogTitle className="dark:text-red-100">
              Delete Business Account?
            </DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              This action cannot be undone. Please enter your admin password to
              confirm deletion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
              <p className="font-medium mb-1">All data will be deleted:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Business profile</li>
                <li>All team users</li>
                <li>Products and inventory</li>
                <li>Sales records</li>
                <li>Settings and preferences</li>
              </ul>
            </div>

            {!isCountingDown && !isDeleting && !deleteError ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Admin Password *
                  </label>
                  <Input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError("");
                    }}
                    placeholder="Enter your admin password"
                    className={`${
                      deleteError
                        ? "border-red-500"
                        : "border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50"
                    }`}
                  />
                  {deleteError && (
                    <p className="text-red-500 text-xs mt-1">{deleteError}</p>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeletePassword("");
                      setDeleteError("");
                    }}
                    className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </>
            ) : deleteError ? (
              <>
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                  </div>
                  <p className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                    Deletion Failed
                  </p>
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300 mb-4">
                    <p>{deleteError}</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setDeleteError("");
                      setIsCountingDown(false);
                      setCountdownValue(5);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 dark:bg-slate-600 dark:hover:bg-slate-700 text-white"
                  >
                    Try Again
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeletePassword("");
                      setDeleteError("");
                    }}
                    className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : isDeleting ? (
              <>
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-500 mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                    Deleting Account
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Please wait while we process your request...
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center py-6">
                  <div
                    className={`text-4xl font-bold mb-2 ${getCountdownColor(countdownValue)}`}
                  >
                    {countdownValue}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                    Account will be deleted in {countdownValue} second
                    {countdownValue !== 1 ? "s" : ""}...
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
                    <div
                      className={`${getProgressBarColor(countdownValue)} h-3 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${(countdownValue / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <Button
                    type="button"
                    onClick={cancelDeletion}
                    className="bg-gray-600 hover:bg-gray-700 dark:bg-slate-600 dark:hover:bg-slate-700 text-white"
                  >
                    Cancel Deletion
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {message && (
        <div
          className={`border rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700"
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700"
          }`}
        >
          <p
            className={`text-sm ${
              message.type === "success"
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}
