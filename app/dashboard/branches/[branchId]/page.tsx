"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Plus, Loader } from "lucide-react";
import { toast } from "sonner";
import { apiRequest, extractApiErrorMessage } from "@/lib/queryClient";
import { getApiErrorText, parseUserFormError } from "@/lib/errorParsers";
import { useResourceNotifications } from "@/hooks/useResourceNotifications";

interface BranchPageProps {
  params: Promise<{
    branchId: string;
  }>;
}

export default function BranchDetailsPage({ params }: BranchPageProps) {
  const { branchId } = use(params);
  const { user, business } = useAuth();
  const { userCreated } = useResourceNotifications();
  const [branch, setBranch] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [processingUser, setProcessingUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "sales" as "admin" | "sales" | "accountant" | "manager",
  });
  const [createUserErrors, setCreateUserErrors] = useState<
    Record<string, string>
  >({});
  const [createUserFormError, setCreateUserFormError] = useState<string | null>(
    null,
  );

  const validateCreateUserForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!createUserForm.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!createUserForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserForm.email)) {
      newErrors.email = "Invalid email format";
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCreateUserForm()) {
      return;
    }

    try {
      setProcessingUser(true);
      setCreateUserFormError(null);

      const payLoad = {
        username: createUserForm.name,
        email: createUserForm.email,
        password: createUserForm.password,
        role: createUserForm.role,
        branchId: branchId,
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

      userCreated(createUserForm.name || "User");
      toast.success("User created successfully");

      // Refresh branch data
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5353/api"}/branches/${branchId}`,
        {
          headers: user?.token
            ? { Authorization: `Bearer ${user.token}` }
            : undefined,
        },
      );
      if (refreshResponse.ok) {
        const updatedBranch = await refreshResponse.json();
        setBranch(updatedBranch);
      }

      setShowCreateUserDialog(false);
      setCreateUserForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "sales",
      });
      setCreateUserErrors({});
      setCreateUserFormError(null);
    } catch (err) {
      const errorText = getApiErrorText(err);
      const parsedErrors = parseUserFormError(errorText);

      if (Object.keys(parsedErrors).length > 0) {
        setCreateUserErrors(parsedErrors);
      }

      setCreateUserFormError(errorText || "Failed to create user");

      toast.error(`Failed to create user: ${errorText}`);
    } finally {
      setProcessingUser(false);
    }
  };

  useEffect(() => {
    async function loadBranch() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5353/api"}/branches/${branchId}`,
          {
            headers: user?.token
              ? { Authorization: `Bearer ${user.token}` }
              : undefined,
          },
        );
        if (!response.ok) {
          throw new Error("Failed to load branch");
        }
        const data = await response.json();
        setBranch(data);

        console.log("Branch details loaded:", data);
      } catch (fetchError) {
        setError("Unable to load branch details.");
      } finally {
        setLoading(false);
      }
    }

    if (branchId) {
      loadBranch();
    }
  }, [branchId, user?.token]);

  if (loading) {
    return (
      <div className="text-sm text-slate-500">Loading branch details...</div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
    );
  }

  if (!branch) {
    return <div className="text-sm text-slate-500">Branch not found.</div>;
  }

  const branchUsers = Array.isArray(branch?.users) ? branch.users : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
          {branch.branchName || "Branch details"}
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Review branch audit data, users, sales, stock movement, and activity.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2 bg-gray-100 dark:bg-slate-700 p-2 rounded-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="stock">Stock Movement</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Branch profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Branch name
                  </p>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {branch.branchName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Branch code
                  </p>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {branch.branchCode || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Status
                  </p>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {branch.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Address
                  </p>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {branch.address || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Branch sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sales audits and branch-specific sales list will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Stock movement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Branch stock movement history and losses will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Branch users</CardTitle>
              <Button
                onClick={() => setShowCreateUserDialog(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create User
              </Button>
            </CardHeader>
            <CardContent>
              {branchUsers.length > 0 ? (
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {branchUsers.map((userEntry: any, index: number) => (
                        <tr
                          key={userEntry?.id || userEntry?.email || index}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <td className="px-4 py-2 dark:text-slate-100">
                            {userEntry?.username || userEntry?.name || "—"}
                          </td>
                          <td className="px-4 py-2 dark:text-slate-300">
                            {userEntry?.email || "—"}
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                              {userEntry?.role || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No users are assigned to this branch yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Branch activity logs and audits will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={showCreateUserDialog}
        onOpenChange={setShowCreateUserDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Add a new user to {branch?.branchName}. The user will be assigned
              to this branch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            {createUserFormError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {createUserFormError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="User name"
                value={createUserForm.name}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    name: e.target.value,
                  })
                }
                disabled={processingUser}
              />
              {createUserErrors.name && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={createUserForm.email}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    email: e.target.value,
                  })
                }
                disabled={processingUser}
              />
              {createUserErrors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={createUserForm.password}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    password: e.target.value,
                  })
                }
                disabled={processingUser}
              />
              {createUserErrors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={createUserForm.confirmPassword}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    confirmPassword: e.target.value,
                  })
                }
                disabled={processingUser}
              />
              {createUserErrors.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={createUserForm.role}
                onValueChange={(value) =>
                  setCreateUserForm({
                    ...createUserForm,
                    role: value as "admin" | "sales" | "accountant" | "manager",
                  })
                }
                disabled={processingUser}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  {user?.role === "admin" && (
                    <SelectItem value="manager">Manager</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {createUserErrors.role && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.role}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateUserDialog(false)}
                disabled={processingUser}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processingUser}
                className="flex-1"
              >
                {processingUser ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
