"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useResourceNotifications } from "@/hooks/useResourceNotifications";
import { useSettings } from "@/context/SettingsContext";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  MoreVertical,
  Edit2,
  Ban,
  Key,
} from "lucide-react";
import { TeamUser } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { set } from "date-fns";
import { te } from "date-fns/locale";
import { Badge } from "../ui/badge";

interface CredentialsSettingsProps {
  role: string;
}

export function CredentialsSettings({ role }: CredentialsSettingsProps) {
  const { user, updateCredentials } = useAuth();
  const { settings, updateSettings } = useSettings();
  const {
    userCreated,
    userUpdated,
    userDeleted,
    userBanned,
    userUnbanned,
    userError,
    notifySuccess,
  } = useResourceNotifications();

  // Get team users from centralized settings
  // const teamUsers = settings?.credentials?.teamUsers || [];

  const [formData, setFormData] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "sales" as "sales" | "accountant" | "manager",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createUserErrors, setCreateUserErrors] = useState<
    Record<string, string>
  >({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(
    null,
  );
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState<
    Record<string, string>
  >({});

  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);

  const isAdminOnly = role === "admin";

  const { data: usersData, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ["users", user?.token],
    enabled: !!user?.token,
  });

  useEffect(() => {
    if (usersData) {
      setTeamUsers(
        usersData.map((user: any) => ({
          ...user,
          id: (user as any).id || (user as any)._id,
          // normalize for code paths that expect id in TeamUser
        })),
      );
    } else {
      setTeamUsers(settings?.credentials?.teamUsers);
    }
  }, [usersData, settings]);

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

  const validateCreateUserForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!createUserForm.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!createUserForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserForm.email)) {
      newErrors.email = "Invalid email format";
    } else if (
      !editingUserId
        ? teamUsers.some((u) => u.email === createUserForm.email)
        : teamUsers.some(
            (u) => u.email === createUserForm.email && u.id !== editingUserId,
          )
    ) {
      newErrors.email = "Email already exists";
    }

    // Only validate password when creating new user, not when editing
    if (!editingUserId) {
      if (!createUserForm.password) {
        newErrors.password = "Password is required";
      } else if (createUserForm.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (createUserForm.password !== createUserForm.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setCreateUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // if (!validateForm()) {
    //   return;
    // }

    try {
      const payLoad = {
        newUserName: formData.newUsername,
        newPassword: formData.newPassword,
        currentPassword: formData.currentPassword,
      };

      await apiRequest(
        "POST",
        `/users/${user?.id}/admin-update-credentials`,
        payLoad,
        user?.token,
      );
      // const success = updateCredentials(
      //   formData.newUsername,
      //   formData.newPassword,
      //   formData.currentPassword,
      // );

      var success = null;

      if (success) {
        toast.success("Admin credentials updated successfully");
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCreateUserForm()) {
      return;
    }

    try {
      // Edit mode
      if (editingUserId) {
        const payLoad = {
          username: createUserForm.name,
          email: createUserForm.email,
          role: createUserForm.role,
          // businessSetup:   // Pass existing business setup to prevent it from being overwritten
        };
        const res = await apiRequest(
          "PUT",
          `/users/${editingUserId}/update`,
          payLoad,
          user?.token,
        );
        if (!res.ok) {
          const text = await res.text();
          toast.error(`Failed to update user: ${text}`);
          setMessage({
            type: "error",
            text: `Failed to update user: ${text}`,
          });
          return;
        }
        const data = await res.json();

        const updatedUser: TeamUser = {
          id: editingUserId,
          name: createUserForm.name,
          email: createUserForm.email,
          role: createUserForm.role,
          lastLogin: data.user.lastLogin,
          createdAt: data.user.createdAt,
        };

        updateSettings({
          credentials: {
            ...settings.credentials,
            teamUsers: teamUsers.map((u) =>
              u.id === editingUserId ? updatedUser : u,
            ),
          },
        });

        // Also update in localStorage
        const state = JSON.parse(
          localStorage.getItem("erp_system_state") || "{}",
        );
        if (state.users) {
          state.users = state.users.map((user: any) =>
            user.id === editingUserId
              ? {
                  ...user,
                  username: createUserForm.email,
                  role:
                    createUserForm.role === "accountant"
                      ? "manager"
                      : createUserForm.role,
                }
              : user,
          );
          localStorage.setItem("erp_system_state", JSON.stringify(state));
        }

        userUpdated(createUserForm.name);
        setMessage({
          type: "success",
          text: `User "${createUserForm.name}" updated successfully!`,
        });
      } else {
        // Create mode
        const payLoad = {
          username: createUserForm.name,
          password: createUserForm.password,
          email: createUserForm.email,
          role: createUserForm.role,
        };

        const res = await apiRequest("POST", "/users/register", payLoad);
        let data = null;
        if (!res.ok) {
          const text = await res.text();
          toast.error(`Failed to create user: ${text}`);
          setMessage({
            type: "error",
            text: `Failed to create user: ${text}`,
          });
          return;
        } else {
          data = await res.json();
        }

        // Add to actual users array (not settings)
        const state = JSON.parse(
          localStorage.getItem("erp_system_state") || "{}",
        );
        if (!state.users) state.users = [];

        // Also add to team users for display in settings
        const newTeamUser: TeamUser = {
          id: data.user.id,
          name: createUserForm.name,
          email: createUserForm.email,
          username: createUserForm.name,
          role: createUserForm.role,
          createdAt: data.user.createdAt,
          lastLogin: null,
        };
        state.users.push(newTeamUser);
        localStorage.setItem("erp_system_state", JSON.stringify(state));
        const updatedUsers = [...teamUsers, newTeamUser];
        updateSettings({
          credentials: {
            ...settings.credentials,
            teamUsers: updatedUsers,
          },
        });

        userCreated(createUserForm.name);
        setMessage({
          type: "success",
          text: `User "${createUserForm.name}" created successfully! They can now log in with email: ${createUserForm.email}`,
        });
      }

      setCreateUserForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "sales",
      });

      setEditingUserId(null);
      setShowCreateUserForm(false);
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      toast.error("Failed to save user. Please try again.");
      setMessage({
        type: "error",
        text: "Failed to save user",
      });

      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await apiRequest(
        "DELETE",
        `/users/${userId}/delete`,
        undefined,
        user?.token,
      );

      if (!res.ok) {
        const text = await res.text();
        toast.error(`Failed to delete user: ${text}`);
        setMessage({
          type: "error",
          text: `Failed to delete user: ${text}`,
        });
        return;
      }

      const updatedUsers = teamUsers.filter((u) => u.id !== userId);

      // Update through centralized settings
      updateSettings({
        credentials: {
          ...settings.credentials,
          teamUsers: updatedUsers,
        },
      });

      userDeleted(teamUsers.find((u) => u.id === userId)?.name || "Unknown");
      setMessage({
        type: "success",
        text: "User deleted successfully",
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      toast.error("Failed to delete user. Please try again.");
      console.error("Failed to delete user:", error);
    }
  };

  const handleEditUser = (user: TeamUser) => {
    if (user) {
      setCreateUserForm({
        name: user.username || user.name,
        email: user.email,
        password: "",
        confirmPassword: "",
        role:
          user.role === "manager"
            ? "accountant"
            : (user.role as "sales" | "accountant" | "manager"),
      });
      setEditingUserId(user.id);
      setShowCreateUserForm(true);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const res = await apiRequest(
        "POST",
        `/users/${userId}/toggle-ban`,
        undefined,
        user?.token,
      );

      if (!res.ok) {
        const text = await res.text();
        toast.error(`Failed to update user ban status: ${text}`);
        return;
      }

      const currentUser = teamUsers.find((u) => u.id === userId);
      const wasCurrentlyBanned = currentUser?.isBanned || false;
      const willBeBanned = !wasCurrentlyBanned;
      const action = willBeBanned ? "banned" : "unbanned";

      const updatedUsers = teamUsers.map((u) =>
        u.id === userId ? { ...u, isBanned: !u.isBanned } : u,
      );
      updateSettings({
        credentials: {
          ...settings.credentials,
          teamUsers: updatedUsers,
        },
      });

      if (willBeBanned) {
        userBanned(currentUser?.name || "User");
      } else {
        userUnbanned(currentUser?.name || "User");
      }
      setMessage({
        type: "success",
        text: `${currentUser?.name} has been ${action} successfully!`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      toast.error("Failed to update user ban status. Please try again.");
      console.error("Failed to update ban status:", error);
    }
  };

  const handleOpenResetPassword = (userId: string) => {
    setResetPasswordUserId(userId);
    setResetPasswordForm({ newPassword: "", confirmPassword: "" });
    setResetPasswordErrors({});
    setShowResetPasswordDialog(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newErrors: Record<string, string> = {};

      if (!resetPasswordForm.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (resetPasswordForm.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters";
      }

      if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      setResetPasswordErrors(newErrors);

      const res = await apiRequest(
        "POST",
        `/users/${user?.id}/reset-password`,
        {
          newPassword: resetPasswordForm.newPassword,
          userId: resetPasswordUserId,
        },
        user?.token,
      );

      if (!res.ok) {
        const text = await res.text();
        toast.error(`Failed to reset password: ${text}`);
        setMessage({
          type: "error",
          text: `Failed to reset password: ${text}`,
        });
        return;
      }

      const userResetting = teamUsers.find((u) => u.id === resetPasswordUserId);
      setMessage({
        type: "success",
        text: `Password reset for "${userResetting?.name}" successfully!`,
      });

      setShowResetPasswordDialog(false);
      setResetPasswordUserId(null);
      setResetPasswordForm({ newPassword: "", confirmPassword: "" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
      setMessage({
        type: "error",
        text: "Failed to reset password",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
              : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Change Credentials Card */}
      <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
        <CardHeader>
          <CardTitle className="dark:text-teal-100">
            Change Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isAdminOnly && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 flex gap-2 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                Managers cannot change their credentials. Contact your admin to
                change credentials.
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
                disabled={!isAdminOnly}
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
                disabled={!isAdminOnly}
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
                disabled={!isAdminOnly}
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
                disabled={!isAdminOnly}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isAdminOnly}
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
                • Keep your credentials secure and don&apos;t share with others
              </li>
              <li>• Change your password regularly for better security</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Team Users Management (Admin Only) */}
      {isAdminOnly && (
        <>
          <Card className="border-blue-200 border-2 dark:bg-slate-800 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-teal-100">
                Team Users ({teamUsers.length})
              </CardTitle>
              <Button
                onClick={() => {
                  setShowCreateUserForm(true);
                  setEditingUserId(null);
                  setCreateUserForm({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "sales",
                  });
                  setCreateUserErrors({});
                }}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              {/* Create User Dialog */}
              <Dialog
                open={showCreateUserForm}
                onOpenChange={(open) => {
                  setShowCreateUserForm(open);
                  if (!open) {
                    setEditingUserId(null);
                    setCreateUserForm({
                      name: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      role: "sales",
                    });
                    setCreateUserErrors({});
                  }
                }}
              >
                <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-blue-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-teal-100">
                      {editingUserId
                        ? "Edit Team User"
                        : "Create New Team User"}
                    </DialogTitle>
                    <DialogDescription className="dark:text-slate-400">
                      {editingUserId
                        ? "Update the user's credentials and role."
                        : "Add a new team member to your system. They can log in immediately with the credentials you set."}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Name *
                      </label>
                      <Input
                        type="text"
                        value={createUserForm.name}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Full name"
                        className={
                          createUserErrors.name
                            ? "border-red-500"
                            : "border-blue-200 dark:border-blue-700 dark:bg-slate-700 dark:text-slate-50"
                        }
                      />
                      {createUserErrors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {createUserErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={createUserForm.email}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="Email address"
                        className={
                          createUserErrors.email
                            ? "border-red-500"
                            : "border-blue-200 dark:border-blue-700 dark:bg-slate-700 dark:text-slate-50"
                        }
                      />
                      {createUserErrors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {createUserErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Password {!editingUserId && "*"}
                      </label>
                      <Input
                        type="password"
                        disabled={editingUserId !== null}
                        value={createUserForm.password}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            password: e.target.value,
                          })
                        }
                        placeholder={
                          editingUserId
                            ? "Use Reset Password option to change"
                            : "Enter password"
                        }
                        className={`${createUserErrors.password ? "border-red-500" : "border-blue-200 dark:border-blue-700 dark:bg-slate-700 dark:text-slate-50"} ${editingUserId ? "opacity-50 cursor-not-allowed" : ""}`}
                      />
                      {createUserErrors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {createUserErrors.password}
                        </p>
                      )}
                      {editingUserId && (
                        <p className="text-blue-500 dark:text-blue-400 text-xs mt-1">
                          To change password, use the Reset Password option in
                          the user menu.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Confirm Password {!editingUserId && "*"}
                      </label>
                      <Input
                        type="password"
                        disabled={editingUserId !== null}
                        value={createUserForm.confirmPassword}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder={
                          editingUserId
                            ? "Use Reset Password option to change"
                            : "Confirm password"
                        }
                        className={`${createUserErrors.confirmPassword ? "border-red-500" : "border-blue-200 dark:border-blue-700 dark:bg-slate-700 dark:text-slate-50"} ${editingUserId ? "opacity-50 cursor-not-allowed" : ""}`}
                      />
                      {createUserErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {createUserErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Role *
                      </label>
                      <select
                        value={createUserForm.role}
                        onChange={(e) =>
                          setCreateUserForm({
                            ...createUserForm,
                            role: e.target.value as
                              | "sales"
                              | "accountant"
                              | "manager",
                          })
                        }
                        className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-md focus:outline-none focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-slate-50"
                      >
                        <option value="sales">Sales</option>
                        <option value="accountant">Accountant</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateUserForm(false);
                          setEditingUserId(null);
                          setCreateUserForm({
                            name: "",
                            email: "",
                            password: "",
                            confirmPassword: "",
                            role: "sales",
                          });
                        }}
                        className="dark:border-blue-700 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        {editingUserId ? "Update User" : "Create User"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Reset Password Dialog */}
              <Dialog
                open={showResetPasswordDialog}
                onOpenChange={setShowResetPasswordDialog}
              >
                <DialogContent className="sm:max-w-md dark:bg-slate-800 dark:border-blue-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-teal-100">
                      Reset User Password
                    </DialogTitle>
                    <DialogDescription className="dark:text-slate-400">
                      Set a new password for this user. They will need to use
                      the new password to log in.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        New Password *
                      </label>
                      <Input
                        type="password"
                        value={resetPasswordForm.newPassword}
                        onChange={(e) =>
                          setResetPasswordForm({
                            ...resetPasswordForm,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Enter new password"
                        className={
                          resetPasswordErrors.newPassword
                            ? "border-red-500"
                            : "border-blue-200 dark:border-blue-700 dark:bg-slate-700 dark:text-slate-50"
                        }
                      />
                      {resetPasswordErrors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {resetPasswordErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Confirm Password *
                      </label>
                      <Input
                        type="password"
                        value={resetPasswordForm.confirmPassword}
                        onChange={(e) =>
                          setResetPasswordForm({
                            ...resetPasswordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm password"
                        className={
                          resetPasswordErrors.confirmPassword
                            ? "border-red-500"
                            : "border-blue-200 dark:border-blue-700 dark:bg-slate-700 dark:text-slate-50"
                        }
                      />
                      {resetPasswordErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {resetPasswordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowResetPasswordDialog(false)}
                        className="dark:border-blue-700 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        Reset Password
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Users Table */}
              {teamUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Role
                        </th>

                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Created
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Last Login
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {teamUsers.map((teamUser) => (
                        <tr
                          key={teamUser.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <td className="px-4 py-2 dark:text-slate-100">
                            {teamUser.username || teamUser.name}
                          </td>
                          <td className="px-4 py-2 text-xs dark:text-slate-400">
                            {teamUser.email}
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                              {teamUser.role}
                            </span>
                          </td>

                          <td className="px-4 py-2 text-xs dark:text-slate-400">
                            {formatDate(teamUser.createdAt)}
                          </td>
                          <td className="px-4 py-2 text-xs dark:text-slate-400">
                            {teamUser.lastLogin
                              ? formatDate(teamUser.lastLogin)
                              : "Never"}
                          </td>
                          <td className="px-4 py-2 text-xs dark:text-slate-400">
                            {teamUser.isActive === false ? (
                              "Inactive"
                            ) : teamUser.isBanned ? (
                              <Badge className="text-xs bg-red-300 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                <Ban className="mr-2 h-4 w-4" />
                                Banned
                              </Badge>
                            ) : (
                              "Active"
                            )}
                          </td>
                          {(teamUser.role === "manager" ||
                            teamUser.role === "sales" ||
                            teamUser.role === "accountant") && (
                            <td className="px-4 py-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 dark:hover:bg-slate-600"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="dark:bg-slate-800 dark:border-slate-700"
                                >
                                  {(teamUser.role === "manager" ||
                                    teamUser.role === "sales" ||
                                    teamUser.role === "accountant") && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        handleEditUser(teamUser);
                                        setEditingUserId(
                                          teamUser.id || teamUser._id || null,
                                        );
                                      }}
                                      className="dark:text-slate-100 dark:focus:bg-slate-700 cursor-pointer"
                                    >
                                      <Edit2 className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleBanUser(teamUser.id)}
                                    className={`dark:text-slate-100 dark:focus:bg-slate-700 cursor-pointer ${teamUser.isBanned ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"} `}
                                  >
                                    {teamUser.isBanned ? (
                                      <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Unban
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="mr-2 h-4 w-4" />
                                        Ban
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenResetPassword(teamUser.id)
                                    }
                                    className="dark:text-slate-100 dark:focus:bg-slate-700 cursor-pointer"
                                  >
                                    <Key className="mr-2 h-4 w-4" />
                                    Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteUser(teamUser.id)
                                    }
                                    className="text-red-600 dark:text-red-400 dark:focus:bg-red-900/20 cursor-pointer"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-slate-400">
                  No team users yet. Create one to get started!
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
function notifySuccess(arg0: string, arg1: string) {
  throw new Error("Function not implemented.");
}
