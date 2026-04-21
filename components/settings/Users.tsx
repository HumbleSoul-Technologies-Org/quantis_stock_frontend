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
  CheckCircle,
  Trash2,
  Plus,
  MoreVertical,
  Edit2,
  Ban,
  Key,
  Loader,
} from "lucide-react";
import { TeamUser } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "../ui/badge";
import { format, set } from "date-fns";

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
    role: "sales" as "sales" | "accountant" | "manager",
  });
  const [createUserErrors, setCreateUserErrors] = useState<
    Record<string, string>
  >({});
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
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);

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

  useEffect(() => {
    if (usersData) {
      setTeamUsers(
        usersData.map((user: any) => ({
          ...user,
          id: (user as any).id || (user as any)._id,
        })),
      );

      localStorage.setItem("teamUsers", JSON.stringify(usersData));
    } else {
      const storedUsers = localStorage.getItem("teamUsers");
      if (storedUsers) {
        setTeamUsers(JSON.parse(storedUsers));
      } else {
        setTeamUsers([]);
      }
    }
  }, [usersData]);

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
      if (editingUserId) {
        const payLoad = {
          username: createUserForm.name,
          email: createUserForm.email,
          role: createUserForm.role,
          businessId: business?._id || user?.businessId,
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
          businessId: business?._id || user?.businessId,
        };

        const res = await apiRequest(
          "POST",
          "/users/register",
          payLoad,
          user?.token,
        );
        if (!res.ok) {
          const text = await res.text();
          toast.error(`Failed to create user: ${text}`);
          return;
        }

        const data = await res.json();

        const newUser: TeamUser = {
          id: data.user._id,
          name: createUserForm.name,
          email: createUserForm.email,
          role: createUserForm.role,
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
      });
      setCreateUserErrors({});
    } catch (error) {
      toast.error("An error occurred");
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
      const payLoad = {
        newPassword: resetPasswordForm.newPassword,
        businessId: business?._id || user?.businessId,
      };

      const res = await apiRequest(
        "PUT",
        `/users/${resetPasswordUserId}/reset-password`,
        payLoad,
        user?.token,
      );
      if (!res.ok) {
        const text = await res.text();
        toast.error(`Failed to reset password: ${text}`);
        return;
      }

      notifySuccess("Password reset successfully");
      setShowResetPasswordDialog(false);
      setResetPasswordUserId(null);
      setResetPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleEditUser = (teamUser: TeamUser) => {
    setCreateUserForm({
      name: teamUser.name || teamUser.username || "",
      email: teamUser.email,
      password: "",
      confirmPassword: "",
      role: teamUser.role as "sales" | "accountant" | "manager",
    });
    setShowCreateUserForm(true);
  };

  const handleBanUser = async (userId: string) => {
    try {
      const teamUser = teamUsers.find((u) => u.id === userId);
      if (!teamUser) return;

      const newBannedStatus = !teamUser.isBanned;

      const res = await apiRequest(
        "PUT",
        `/users/${userId}/ban`,
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await apiRequest(
        "DELETE",
        `/users/${userId}`,
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
                    {user?.role !== "admin" && (
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                        Email
                      </th>
                    )}
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
                    {user?.role !== "admin" && (
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                        Actions
                      </th>
                    )}
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
                      {user?.role !== "admin" && (
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
                      {user?.role !== "admin" && (
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
                                onClick={() => handleDeleteUser(teamUser.id)}
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
