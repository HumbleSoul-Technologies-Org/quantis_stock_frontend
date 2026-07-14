"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { Plus, Edit2, Trash2, MapPinned, Search } from "lucide-react";
import { toast } from "sonner";
import BranchMap from "@/components/settings/BranchMap";

interface BranchForm {
  branchName: string;
  branchCode: string;
  address: string;
  region: string;
  district: string;
  country: string;
  latitude: string;
  longitude: string;
  status: string;
  notes: string;
}

interface BranchSummary {
  id: string;
  branchName: string;
  branchCode?: string;
  address?: string;
  district?: string;
  city?: string;
  country?: string;
  region?: string;
  status?: string;
  users?: any[];
  salesCount?: number | string | null;
  lossCount?: number | string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export default function BranchManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchSummary | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [branchForm, setBranchForm] = useState<BranchForm>({
    branchName: "",
    branchCode: "",
    address: "",
    region: "",
    district: "",
    country: "",
    latitude: "",
    longitude: "",
    status: "active",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "sales" | "losses" | "users"
  >("all");

  const { data: branchesData, refetch } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/branches", {}, user?.token);
      if (!res.ok) {
        throw new Error("Failed to fetch branches");
      }
      return res.json();
    },
    enabled: !!user?.token,
    refetchInterval: 0,
  });

  const branches: BranchSummary[] = Array.isArray(branchesData)
    ? branchesData.map((branch: any) => ({
        id: branch._id || branch.id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        address: branch.address,
        district: branch.district,
        city: branch.city || branch.branchCity,
        country: branch.country,
        region: branch.region,
        status: branch.status,
        users: branch.users,
        salesCount: branch.sales?.length ?? 0,
        lossCount:
          branch.stockMovements?.filter(
            (m: any) =>
              (m.type === "out" && m.reason !== "Sale") ||
              m.reason !== "Stock Transfer",
          ).length ?? 0,
        latitude: branch.latitude,
        longitude: branch.longitude,
      }))
    : [];

  const filteredBranches = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matchesSearch = (branch: BranchSummary) => {
      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        branch.branchName,
        branch.branchCode,
        branch.district,
        branch.city,
        branch.country,
        branch.region,
        branch.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    };

    const result = branches.filter(matchesSearch);

    if (activeFilter === "sales") {
      return [...result].sort(
        (a, b) => Number(b.salesCount ?? 0) - Number(a.salesCount ?? 0),
      );
    }

    if (activeFilter === "losses") {
      return [...result].sort(
        (a, b) => Number(b.lossCount ?? 0) - Number(a.lossCount ?? 0),
      );
    }

    if (activeFilter === "users") {
      return [...result].sort(
        (a, b) => (b.users?.length || 0) - (a.users?.length || 0),
      );
    }

    return result;
  }, [activeFilter, branches, searchQuery]);

  const resetForm = () => {
    setBranchForm({
      branchName: "",
      branchCode: "",
      address: "",
      region: "",
      district: "",
      country: "",
      latitude: "",
      longitude: "",
      status: "active",
      notes: "",
    });
    setFormErrors({});
    setEditingBranch(null);
  };

  const openNewBranch = () => {
    resetForm();
    setShowBranchForm(true);
  };

  const openEditBranch = (branch: BranchSummary) => {
    setEditingBranch(branch);
    setBranchForm({
      branchName: branch.branchName || "",
      branchCode: branch.branchCode || "",
      address: branch.address || "",
      region: "",
      district: "",
      country: "",
      latitude: "",
      longitude: "",
      status: branch.status || "active",
      notes: "",
    });
    setShowBranchForm(true);
  };

  const validateBranchForm = () => {
    const errors: Record<string, string> = {};
    if (!branchForm.branchName.trim()) {
      errors.branchName = "Branch name is required";
    }
    return errors;
  };

  const handleSaveBranch = async () => {
    const errors = validateBranchForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        ...branchForm,
        latitude: branchForm.latitude ? Number(branchForm.latitude) : undefined,
        longitude: branchForm.longitude
          ? Number(branchForm.longitude)
          : undefined,
      };

      const method = editingBranch ? "PUT" : "POST";
      const endpoint = editingBranch
        ? `/branches/${editingBranch.id}`
        : "/branches";

      const res = await apiRequest(method, endpoint, payload, user?.token);
      if (!res.ok) {
        const text = await res.text();
        toast.error(text || "Failed to save branch");
        setProcessing(false);
        return;
      }

      toast.success(editingBranch ? "Branch updated" : "Branch created");
      setShowBranchForm(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error("An unexpected error occurred while saving branch");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm("Delete this branch? This cannot be undone.")) return;
    try {
      const res = await apiRequest(
        "DELETE",
        `/branches/${branchId}`,
        {},
        user?.token,
      );
      if (!res.ok) {
        const text = await res.text();
        toast.error(text || "Failed to delete branch");
        return;
      }
      toast.success("Branch deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete branch");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-teal-100">
            Branch Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Create and manage branches, then assign users and review
            branch-level activity.
          </p>
        </div>
        <Button
          onClick={openNewBranch}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-teal-600"
        >
          <Plus className="w-4 h-4 mr-2" /> New Branch
        </Button>
      </div>

      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="h-5 w-5" /> Branch map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Branches with saved coordinates appear on the map below. Click a
              marker to view branch details.
            </p>
          </div>
          <BranchMap branches={branches} />
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Branch list</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, code, district, city, country..."
                className="h-9 pl-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
              >
                All branches
              </Button>
              <Button
                variant={activeFilter === "sales" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("sales")}
              >
                Most sales
              </Button>
              <Button
                variant={activeFilter === "losses" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("losses")}
              >
                Most losses
              </Button>
              <Button
                variant={activeFilter === "users" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("users")}
              >
                Most users
              </Button>
            </div>
          </div>

          {branches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
              No branches found yet. Create one to begin assigning users and
              tracking branch activity.
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600 dark:border-slate-700 dark:text-slate-300">
              No branches match your current search or filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                      Users
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredBranches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                      onClick={(event) => {
                        const target = event.target as HTMLElement;
                        if (target.closest("button") || target.closest("a")) {
                          return;
                        }
                        router.push(`/dashboard/branches/${branch.id}`);
                      }}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-slate-100">
                        <span className="font-medium text-blue-600 dark:text-cyan-300">
                          {branch.branchName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
                        {branch.branchCode || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
                        {branch.address || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
                        {branch.status || "active"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
                        {branch.users?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditBranch(branch);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteBranch(branch.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showBranchForm}
        onOpenChange={(open) => setShowBranchForm(open)}
      >
        <DialogContent className="sm:max-w-2xl z-[9999]">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? "Edit Branch" : "Create Branch"}
            </DialogTitle>
            <DialogDescription>
              {editingBranch
                ? "Update branch tracking details and branch metadata."
                : "Create a new branch to assign users and capture branch audits."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Branch name *
              </label>
              <Input
                value={branchForm.branchName}
                onChange={(e) =>
                  setBranchForm({ ...branchForm, branchName: e.target.value })
                }
                placeholder="Enter branch name ie 'Main Branch' , Mukono Branch etc"
                className={
                  formErrors.branchName
                    ? "border-red-500"
                    : "border-0 dark:bg-slate-900   focus:ring-1 focus:ring-teal-500 bg-accent dark:focus:ring-teal-500"
                }
              />
              {formErrors.branchName && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.branchName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Branch code
              </label>
              <Input
                value={branchForm.branchCode}
                placeholder="Enter branch code ie 'MB001' , 'MB002' etc"
                onChange={(e) =>
                  setBranchForm({ ...branchForm, branchCode: e.target.value })
                }
                className="border-0  focus:ring-1 focus:ring-teal-500 bg-accent dark:focus:ring-teal-500 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Address
              </label>
              <Input
                value={branchForm.address}
                onChange={(e) =>
                  setBranchForm({ ...branchForm, address: e.target.value })
                }
                className="border-0  focus:ring-1 focus:ring-teal-500 bg-accent dark:focus:ring-teal-500 dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Region
                </label>
                <Input
                  value={branchForm.region}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, region: e.target.value })
                  }
                  className="border-0  focus:ring-1 focus:ring-teal-500 bg-accent dark:focus:ring-teal-500 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  District
                </label>
                <Input
                  value={branchForm.district}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, district: e.target.value })
                  }
                  className="border-0  focus:ring-1 focus:ring-teal-500 bg-accent dark:focus:ring-teal-500 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Country
                </label>
                <Input
                  value={branchForm.country}
                  onChange={(e) =>
                    setBranchForm({ ...branchForm, country: e.target.value })
                  }
                  className="border-0  focus:ring-1 focus:ring-teal-500 bg-accent dark:focus:ring-teal-500 dark:bg-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Latitude
                  </label>
                  <Input
                    value={branchForm.latitude}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, latitude: e.target.value })
                    }
                    className="border-0  focus:ring-1 focus:ring-teal-500 bg-accent dark:focus:ring-teal-500 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Longitude
                  </label>
                  <Input
                    value={branchForm.longitude}
                    onChange={(e) =>
                      setBranchForm({
                        ...branchForm,
                        longitude: e.target.value,
                      })
                    }
                    className="border-0  focus:ring-1 focus:ring-teal-500 bg-accent dark:focus:ring-teal-500 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Notes
              </label>
              <Input
                value={branchForm.notes}
                onChange={(e) =>
                  setBranchForm({ ...branchForm, notes: e.target.value })
                }
                className="border-0  focus:ring-1 focus:ring-teal-500 bg-accent dark:focus:ring-teal-500 dark:bg-slate-900"
              />
            </div>
          </div>

          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBranchForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveBranch} disabled={processing}>
                {processing
                  ? "Saving..."
                  : editingBranch
                    ? "Update Branch"
                    : "Create Branch"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
