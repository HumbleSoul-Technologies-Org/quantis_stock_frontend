"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import {
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { TeamUser } from "@/lib/types";

interface CredentialsSettingsProps {
  role: string;
}

export function CredentialsSettings({ role }: CredentialsSettingsProps) {
  const { user, updateCredentials } = useAuth();
  const { settings, updateSettings } = useSettings();

  // Get team users from centralized settings
  const teamUsers = settings?.credentials?.teamUsers || [];

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

  const isAdminOnly = role === "admin";

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
    } else if (teamUsers.some((u) => u.email === createUserForm.email)) {
      newErrors.email = "Email already exists";
    }

    if (!createUserForm.password) {
      newErrors.password = "Password is required";
    } else if (createUserForm.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (createUserForm.password !== createUserForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setCreateUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      const success = updateCredentials(
        formData.newUsername,
        formData.newPassword,
        formData.currentPassword,
      );

      if (success) {
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
      const newUser: TeamUser = {
        id: Date.now().toString(),
        name: createUserForm.name,
        email: createUserForm.email,
        password: createUserForm.password,
        role: createUserForm.role,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };

      // Update through centralized settings
      const updatedUsers = [...teamUsers, newUser];
      updateSettings({
        credentials: {
          ...settings.credentials,
          teamUsers: updatedUsers,
        },
      });

      setMessage({
        type: "success",
        text: `User "${createUserForm.name}" created successfully!`,
      });

      setCreateUserForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "sales",
      });

      setShowCreateUserForm(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to create user",
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = teamUsers.find((u) => u.id === userId);
    if (confirm(`Are you sure you want to delete ${userToDelete?.name}?`)) {
      const updatedUsers = teamUsers.filter((u) => u.id !== userId);

      // Update through centralized settings
      updateSettings({
        credentials: {
          ...settings.credentials,
          teamUsers: updatedUsers,
        },
      });

      setMessage({
        type: "success",
        text: "User deleted successfully",
      });

      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    setMessage({
      type: "success",
      text: "Password copied to clipboard",
    });

    setTimeout(() => setMessage(null), 2000);
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
                onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              {/* Create User Form */}
              {showCreateUserForm && (
                <form
                  onSubmit={handleCreateUser}
                  className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4 dark:bg-blue-900/20 dark:border-blue-700"
                >
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
                      Password *
                    </label>
                    <Input
                      type="password"
                      value={createUserForm.password}
                      onChange={(e) =>
                        setCreateUserForm({
                          ...createUserForm,
                          password: e.target.value,
                        })
                      }
                      placeholder="Enter password"
                      className={
                        createUserErrors.password
                          ? "border-red-500"
                          : "border-blue-200 dark:border-blue-700 dark:bg-slate-700 dark:text-slate-50"
                      }
                    />
                    {createUserErrors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {createUserErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      value={createUserForm.confirmPassword}
                      onChange={(e) =>
                        setCreateUserForm({
                          ...createUserForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm password"
                      className={
                        createUserErrors.confirmPassword
                          ? "border-red-500"
                          : "border-blue-200 dark:border-blue-700 dark:bg-slate-700 dark:text-slate-50"
                      }
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

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Create User
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateUserForm(false)}
                      className="dark:border-blue-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

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
                          Password
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Created
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Last Login
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
                            {teamUser.name}
                          </td>
                          <td className="px-4 py-2 text-xs dark:text-slate-400">
                            {teamUser.email}
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                              {teamUser.role}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded dark:text-slate-100">
                                {showPassword[teamUser.id]
                                  ? teamUser.password
                                  : "•".repeat(teamUser.password.length)}
                              </code>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPassword({
                                    ...showPassword,
                                    [teamUser.id]: !showPassword[teamUser.id],
                                  })
                                }
                                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                              >
                                {showPassword[teamUser.id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyPassword(teamUser.password)
                                }
                                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded text-blue-600 dark:text-blue-400"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-xs dark:text-slate-400">
                            {formatDate(teamUser.createdAt)}
                          </td>
                          <td className="px-4 py-2 text-xs dark:text-slate-400">
                            {teamUser.lastLogin
                              ? formatDate(teamUser.lastLogin)
                              : "Never"}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(teamUser.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
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
