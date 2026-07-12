"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BranchPageProps {
  params: Promise<{
    branchId: string;
  }>;
}

export default function BranchDetailsPage({ params }: BranchPageProps) {
  const { branchId } = use(params);
  const { user } = useAuth();
  const [branch, setBranch] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
            <CardHeader>
              <CardTitle>Branch users</CardTitle>
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
    </div>
  );
}
