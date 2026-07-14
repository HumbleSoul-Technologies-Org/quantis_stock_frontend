"use client";

import { use, useEffect, useState } from "react";
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
import { encryptedStorageService } from "@/lib/encryptedStorage";
import { sessionKeyManager } from "@/lib/sessionKeyManager";
import { toast } from "sonner";
import {
  CheckCircle,
  Trash2,
  Plus,
  MoreVertical,
  Edit2,
  Ban,
  Key,
  Loader,
  AlertCircle,
} from "lucide-react";
import { TeamUser } from "@/lib/types";
import { apiRequest, extractApiErrorMessage } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../ui/badge";
import { format, set } from "date-fns";
import {
  getApiErrorText,
  parseUserFormError,
  parseResetPasswordError,
} from "@/lib/errorParsers";

export function Users() {
  const { user, business } = useAuth();
  const { userCreated, userUpdated, userDeleted, userBanned, userUnbanned } =
    useResourceNotifications();

  const notifySuccess = (message: string) => {
    toast.success(message);
  };

  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "sales" as "admin" | "sales" | "accountant" | "manager",
    branchId: "",
  });
  const [createUserErrors, setCreateUserErrors] = useState<
    Record<string, string>
  >({});
  const [createUserFormError, setCreateUserFormError] = useState<string | null>(
    null,
  );
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
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
  const [resetPasswordFormError, setResetPasswordFormError] = useState<
    string | null
  >(null);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [branches, setBranches] = useState<
    Array<{ id: string; branchName: string }>
  >([]);

  const isAdmin = user?.role === "admin";

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/users/${business?._id || user?.businessId}`,
        {},
        user?.token,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      return res.json();
    },
    enabled: !!user?.token,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes to keep user list up-to-date
  });

  const { data: branchesData } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/branches", {}, user?.token);
      if (!res.ok) {
        throw new Error("Failed to fetch branches");
      }
      return res.json();
    },
    enabled: !!user?.token,
    refetchInterval: 10 * 60 * 1000,
  });

  useEffect(() => {
    const persistUsers = async () => {
      if (usersData) {
        const normalizedUsers = usersData.map((user: any) => ({
          ...user,
          id: (user as any).id || (user as any)._id,
        }));

        setTeamUsers(normalizedUsers);
        if (branchesData) {
          setBranches(
            branchesData.map((branch: any) => ({
              id: branch._id || branch.id,
              branchName: branch.branchName,
            })),
          );
        }

        if (typeof window !== "undefined") {
          if (sessionKeyManager.isInitialized()) {
            await encryptedStorageService.setEncrypted(
              "teamUsers",
              normalizedUsers,
            );
          } else {
            localStorage.setItem("teamUsers", JSON.stringify(normalizedUsers));
          }
        }

        return;
      }

      if (branchesData) {
        setBranches(
          branchesData.map((branch: any) => ({
            id: branch._id || branch.id,
            branchName: branch.branchName,
          })),
        );
      }

      if (typeof window !== "undefined") {
        if (sessionKeyManager.isInitialized()) {
          const storedUsers =
            await encryptedStorageService.getDecrypted<TeamUser[]>("teamUsers");
          if (storedUsers) {
            setTeamUsers(storedUsers);
            return;
          }
        }

        const storedUsers = localStorage.getItem("teamUsers");
        if (storedUsers) {
          try {
            setTeamUsers(JSON.parse(storedUsers));
            return;
          } catch (error) {
            console.error("Failed to parse cached team users:", error);
          }
        }
      }

      setTeamUsers([]);
    };

    persistUsers();
  }, [usersData, branchesData]);

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

    if (createUserForm.role !== "admin" && !createUserForm.branchId) {
      newErrors.branchId = "Branch is required for non-admin users";
    }

    setCreateUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetPasswordForm = (): boolean => {
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
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCreateUserForm()) {
      return;
    }

    try {
      setProcessing(true);
      setCreateUserFormError(null);
      if (editingUserId) {
        const payLoad = {
          username: createUserForm.name,
          email: createUserForm.email,
          role: createUserForm.role,
          branchId: createUserForm.branchId || null,
          businessId: business?._id || user?.businessId,
        };

        const res = await apiRequest(
          "PUT",
          `/users/${editingUserId}/update`,
          payLoad,
          user?.token,
        );
        if (!res.ok) {
          const errorText = extractApiErrorMessage(res);
          throw new Error(errorText);
        }
        const data = await res.json();

        const updatedUser: TeamUser = {
          id: editingUserId,
          name: createUserForm.name,
          email: createUserForm.email,
          role: createUserForm.role,
          branchId: createUserForm.branchId || null,
          lastLogin: data.user.lastLogin,
          createdAt: data.user.createdAt,
        };

        setTeamUsers(
          teamUsers.map((u) => (u.id === editingUserId ? updatedUser : u)),
        );

        userUpdated(updatedUser.name || updatedUser.username || "User");
        notifySuccess("User updated successfully");
        refetchUsers();
      } else {
        const payLoad = {
          username: createUserForm.name,
          email: createUserForm.email,
          password: createUserForm.password,
          role: createUserForm.role,
          branchId: createUserForm.branchId || null,
          businessId: business?._id || user?.businessId,
        };

        const res = await apiRequest(
          "POST",
          "/users/register",
          payLoad,
          user?.token,
        );
        if (!res.ok) {
          const errorText = extractApiErrorMessage(res);
          throw new Error(errorText);
        }
        const data = await res.json();

        const newUser: TeamUser = {
          id: data.user.id,
          name: data.user.username,
          email: data.user.email,
          role: data.user.role,
          branchId: data.user.branchId || null,
          createdAt: data.user.createdAt,
          lastLogin: null,
        };

        setTeamUsers([...teamUsers, newUser]);

        userCreated(newUser.name || newUser.username || "User");
        notifySuccess("User created successfully");
        refetchUsers();
      }

      setShowCreateUserForm(false);
      setEditingUserId(null);
      setCreateUserForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "sales",
        branchId: "",
      });
      setCreateUserErrors({});
      setCreateUserFormError(null);
    } catch (error) {
      const errorText = getApiErrorText(error);
      const parsedErrors = parseUserFormError(errorText);

      if (Object.keys(parsedErrors).length > 0) {
        setCreateUserErrors(parsedErrors);
      }

      setCreateUserFormError(errorText || "Failed to save user");

      toast.error(
        `Failed to ${editingUserId ? "update" : "create"} user: ${errorText}`,
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateResetPasswordForm()) {
      return;
    }

    try {
      setResetPasswordFormError(null);
      const payLoad = {
        newPassword: resetPasswordForm.newPassword,
        businessId: business?._id || user?.businessId,
      };

      await apiRequest(
        "POST",
        `/users/${resetPasswordUserId}/user-password/change`,
        payLoad,
        user?.token,
      );

      notifySuccess("Password reset successfully");
      setShowResetPasswordDialog(false);
      setResetPasswordUserId(null);
      setResetPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorText = getApiErrorText(error);
      const parsedErrors = parseResetPasswordError(errorText);

      if (Object.keys(parsedErrors).length > 0) {
        setResetPasswordErrors(parsedErrors);
      } else {
        setResetPasswordFormError(errorText || "Failed to reset password");
      }

      toast.error(`Failed to reset password: ${errorText}`);
    }
  };

  const handleEditUser = (teamUser: TeamUser) => {
    setCreateUserForm({
      name: teamUser.name || teamUser.username || "",
      email: teamUser.email,
      password: "",
      confirmPassword: "",
      role: teamUser.role as "admin" | "sales" | "accountant" | "manager",
      branchId: teamUser.branchId || "",
    });
    setShowCreateUserForm(true);
  };

  const handleBanUser = async (userId: string) => {
    try {
      const teamUser = teamUsers.find((u) => u.id === userId);
      if (!teamUser) return;

      const newBannedStatus = !teamUser.isBanned;

      const res = await apiRequest(
        "POST",
        `/users/${userId}/toggle-ban`,
        { banned: newBannedStatus },
        user?.token,
      );
      if (!res.ok) {
        const text = await res.text();
        toast.error(
          `Failed to ${newBannedStatus ? "ban" : "unban"} user: ${text}`,
        );
        return;
      }

      setTeamUsers(
        teamUsers.map((u) =>
          u.id === userId ? { ...u, isBanned: newBannedStatus } : u,
        ),
      );

      if (newBannedStatus) {
        userBanned(teamUser.name || teamUser.username || "User");
        notifySuccess("User banned successfully");
      } else {
        userUnbanned(teamUser.name || teamUser.username || "User");
        notifySuccess("User unbanned successfully");
      }
      refetchUsers();
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteUser = async (userId: any) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await apiRequest(
        "DELETE",
        `/users/${userId}/delete`,
        {},
        user?.token,
      );
      if (!res.ok) {
        const text = await res.text();
        toast.error(`Failed to delete user: ${text}`);
        return;
      }

      const deletedUser = teamUsers.find((u) => u.id === userId);
      setTeamUsers(teamUsers.filter((u) => u.id !== userId));

      if (deletedUser) {
        userDeleted(deletedUser.name || deletedUser.username || "User");
        notifySuccess("User deleted successfully");
      }
      refetchUsers();
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleOpenResetPassword = (userId: string) => {
    setResetPasswordUserId(userId);
    setShowResetPasswordDialog(true);
    setResetPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    setResetPasswordErrors({});
    setResetPasswordFormError(null);
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  if (!isAdmin) {
    return (
      <Card className="border-red-200 border-2 dark:bg-slate-800 dark:border-red-700">
        <CardContent className="pt-6">
          <p className="text-red-700 dark:text-red-300 text-center">
            Access denied. Only admins can manage users.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 min-h-screen border-2 dark:bg-slate-800 dark:border-teal-300">
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
                branchId: "",
              });
              setCreateUserErrors({});
              setCreateUserFormError(null);
            }}
            className="dark:bg-teal-600 dark:text-white bg-blue-600 hover:bg-blue-700  dark:hover:bg-teal-800 gap-2"
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
                  branchId: "",
                });
                setCreateUserErrors({});
              }
            }}
          >
            <DialogContent
              disableOutsideClick
              className="sm:max-w-md dark:bg-slate-800 dark:border-teal-700"
            >
              <DialogHeader>
                <DialogTitle className="dark:text-teal-100">
                  {editingUserId ? "Edit Team User" : "Create New Team User"}
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
                    onChange={(e) => {
                      setCreateUserForm({
                        ...createUserForm,
                        name: e.target.value,
                      });
                      if (createUserFormError) setCreateUserFormError(null);
                      if (createUserErrors.name)
                        setCreateUserErrors({
                          ...createUserErrors,
                          name: "",
                        });
                    }}
                    placeholder="Full name"
                    className={
                      createUserErrors.name
                        ? "border-red-500"
                        : "border-0 dark:bg-slate-900 dark:text-slate-50"
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
                    onChange={(e) => {
                      setCreateUserForm({
                        ...createUserForm,
                        email: e.target.value,
                      });
                      if (createUserFormError) setCreateUserFormError(null);
                      if (createUserErrors.email)
                        setCreateUserErrors({
                          ...createUserErrors,
                          email: "",
                        });
                    }}
                    placeholder="Email address"
                    className={
                      createUserErrors.email
                        ? "border-red-500"
                        : "border-0 dark:bg-slate-900 dark:text-slate-50"
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
                    onChange={(e) => {
                      setCreateUserForm({
                        ...createUserForm,
                        password: e.target.value,
                      });
                      if (createUserFormError) setCreateUserFormError(null);
                      if (createUserErrors.password)
                        setCreateUserErrors({
                          ...createUserErrors,
                          password: "",
                        });
                    }}
                    placeholder={
                      editingUserId
                        ? "Use Reset Password option to change"
                        : "Enter password"
                    }
                    className={`${createUserErrors.password ? "border-red-500" : "border-0 dark:bg-slate-900 dark:text-slate-50"} ${editingUserId ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  {createUserErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {createUserErrors.password}
                    </p>
                  )}
                  {editingUserId && (
                    <p className="text-blue-500 dark:text-blue-400 text-xs mt-1">
                      To change password, use the Reset Password option in the
                      user menu.
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
                    onChange={(e) => {
                      setCreateUserForm({
                        ...createUserForm,
                        confirmPassword: e.target.value,
                      });
                      if (createUserFormError) setCreateUserFormError(null);
                      if (createUserErrors.confirmPassword)
                        setCreateUserErrors({
                          ...createUserErrors,
                          confirmPassword: "",
                        });
                    }}
                    placeholder={
                      editingUserId
                        ? "Use Reset Password option to change"
                        : "Confirm password"
                    }
                    className={`${createUserErrors.confirmPassword ? "border-red-500" : "border-0 dark:bg-slate-900 dark:text-slate-50"} ${editingUserId ? "opacity-50 cursor-not-allowed" : ""}`}
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
                          | "admin"
                          | "sales"
                          | "accountant"
                          | "manager",
                      })
                    }
                    className="w-full px-3 py-2 border border-blue-200 dark:border-teal-700 rounded-md focus:outline-none focus:ring-blue-500 bg-white dark:bg-slate-900 dark:text-slate-50"
                  >
                    <option value="sales">Sales</option>
                    <option value="accountant">Accountant</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {createUserForm.role !== "admin" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Branch *
                    </label>
                    <select
                      value={createUserForm.branchId}
                      onChange={(e) => {
                        setCreateUserForm({
                          ...createUserForm,
                          branchId: e.target.value,
                        });
                        if (createUserErrors.branchId) {
                          setCreateUserErrors({
                            ...createUserErrors,
                            branchId: "",
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-blue-200 dark:border-teal-700 rounded-md focus:outline-none focus:ring-blue-500 bg-white dark:bg-slate-900 dark:text-slate-50"
                    >
                      <option value="">Select branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                    {createUserErrors.branchId && (
                      <p className="text-red-500 text-xs mt-1">
                        {createUserErrors.branchId}
                      </p>
                    )}
                  </div>
                )}

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
                        branchId: "",
                      });
                    }}
                    className="dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 dark:text-white hover:bg-blue-700 dark:bg-teal-500 dark:hover:bg-teal-700"
                  >
                    {editingUserId ? (
                      processing ? (
                        <>
                          Updating... <Loader className="animate-spin" />
                        </>
                      ) : (
                        "Update User"
                      )
                    ) : processing ? (
                      <>
                        Creating... <Loader className="animate-spin" />
                      </>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </div>
              </form>

              {createUserFormError && (
                <div className="flex items-center gap-3 p-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="flex-1">{createUserFormError}</div>
                  <button
                    type="button"
                    onClick={() => setCreateUserFormError(null)}
                    className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                  >
                    ✕
                  </button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Reset Password Dialog */}
          <Dialog
            open={showResetPasswordDialog}
            onOpenChange={setShowResetPasswordDialog}
          >
            <DialogContent
              disableOutsideClick
              className="sm:max-w-md dark:bg-slate-800 dark:border-teal-700"
            >
              <DialogHeader>
                <DialogTitle className="dark:text-teal-100">
                  Reset User Password
                </DialogTitle>
                <DialogDescription className="dark:text-slate-400">
                  Set a new password for this user. They will need to use the
                  new password to log in.
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
                    onChange={(e) => {
                      setResetPasswordForm({
                        ...resetPasswordForm,
                        newPassword: e.target.value,
                      });
                      if (resetPasswordFormError)
                        setResetPasswordFormError(null);
                      if (resetPasswordErrors.newPassword)
                        setResetPasswordErrors({
                          ...resetPasswordErrors,
                          newPassword: "",
                        });
                    }}
                    placeholder="Enter new password"
                    className={
                      resetPasswordErrors.newPassword
                        ? "border-red-500"
                        : "border-0 dark:bg-slate-900 dark:text-slate-50"
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
                    onChange={(e) => {
                      setResetPasswordForm({
                        ...resetPasswordForm,
                        confirmPassword: e.target.value,
                      });
                      if (resetPasswordFormError)
                        setResetPasswordFormError(null);
                      if (resetPasswordErrors.confirmPassword)
                        setResetPasswordErrors({
                          ...resetPasswordErrors,
                          confirmPassword: "",
                        });
                    }}
                    placeholder="Confirm password"
                    className={
                      resetPasswordErrors.confirmPassword
                        ? "border-red-500"
                        : "border-0 dark:bg-slate-900 dark:text-slate-50"
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

              {resetPasswordFormError && (
                <div className="flex items-center gap-3 p-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="flex-1">{resetPasswordFormError}</div>
                  <button
                    type="button"
                    onClick={() => setResetPasswordFormError(null)}
                    className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                  >
                    ✕
                  </button>
                </div>
              )}
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
                  {teamUsers
                    .filter((user) => user.role !== "admin")
                    .map((teamUser: any, index) => (
                      <tr
                        key={teamUser.id || index}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <td className="px-4 py-2 dark:text-slate-100">
                          {teamUser.username || teamUser.name}
                        </td>
                        {teamUser?.role !== "admin" && (
                          <td className="px-4 py-2">{teamUser.email}</td>
                        )}
                        <td className="px-4 py-2">
                          <Badge variant="secondary" className="text-xs">
                            {teamUser.role}
                          </Badge>
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
                        {teamUser?.role !== "admin" && (
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
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleBanUser(
                                      teamUser.id || teamUser._id || "",
                                    )
                                  }
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
                                    handleOpenResetPassword(
                                      teamUser.id || teamUser._id || "",
                                    )
                                  }
                                  className="dark:text-slate-100 dark:focus:bg-slate-700 cursor-pointer"
                                >
                                  <Key className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteUser(
                                      teamUser.id || teamUser._id || "",
                                    )
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
            <p className="text-gray-500 dark:text-slate-400 text-center py-8">
              No team users found. Add your first user above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
