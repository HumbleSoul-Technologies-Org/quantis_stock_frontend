"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { AssetForm } from "@/components/assets/AssetForm";
import { AssetTable } from "@/components/assets/AssetTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchAssetCategories,
  fetchAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  createAssetCategory,
  deleteAssetCategory,
} from "@/components/assets/assetService";
import type { Asset, AssetCategory, AssetPayload, Branch } from "@/lib/types";

const defaultBranchOptions: Branch[] = [];

export default function AssetsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isManufacturer = user?.business?.businessType === "manufacturer";

  useEffect(() => {
    if (user && !isManufacturer) {
      router.replace("/dashboard");
    }
  }, [user, isManufacturer, router]);

  if (user && !isManufacturer) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-slate-500">
          Asset management is only available for manufacturing business types.
        </p>
      </div>
    );
  }

  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>(defaultBranchOptions);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isCategoryCreating, setIsCategoryCreating] = useState(false);
  const [isCategoryDeleting, setIsCategoryDeleting] = useState<string | null>(
    null,
  );
  const [categoryToDelete, setCategoryToDelete] =
    useState<AssetCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [serverError, setServerError] = useState("");

  const effectiveBranchId = useMemo(() => {
    if (user?.branchId) {
      return user.branchId;
    }
    return selectedBranchId === "all" ? undefined : selectedBranchId;
  }, [selectedBranchId, user?.branchId]);

  const branchOptions = useMemo(() => {
    const options = [{ id: "all", branchName: "All branches" }];
    if (branches.length > 0) {
      const normalizedBranches = branches
        .map((branch) => ({
          id: String(branch.id || branch._id),
          branchName: branch.branchName || branch.branchCode || "Branch",
        }))
        .filter((branch) => branch.id);
      return options.concat(normalizedBranches);
    }

    if (user?.branchId) {
      return options.concat([
        {
          id: String(user.branchId),
          branchName: "Your branch",
        },
      ]);
    }

    return options;
  }, [branches, user?.branchId]);

  const loadBranches = async () => {
    if (!user?.token) return;
    setIsBranchLoading(true);

    try {
      const response = await apiRequest("GET", "/branches", {}, user.token);
      if (!response.ok) {
        throw new Error("Unable to load branches");
      }

      const payload = await response.json();
      const branchData =
        Array.isArray(payload) && payload.length > 0
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      const normalizedBranches = branchData
        .map((branch: any) => ({
          id: branch._id || branch.id,
          branchName:
            branch.branchName || branch.name || branch.branchCode || "Branch",
        }))
        .filter((branch: Branch) => Boolean(branch.id));

      setBranches(normalizedBranches);
    } catch (error) {
      console.error("Failed to load branches", error);
    } finally {
      setIsBranchLoading(false);
    }
  };

  const loadData = async () => {
    if (!user?.token || !user?.businessId) return;
    setIsLoading(true);
    try {
      const [categoryData, assetData] = await Promise.all([
        fetchAssetCategories(user.token, user.businessId),
        fetchAssets(user.token, user.businessId, effectiveBranchId),
      ]);
      setCategories(categoryData);
      setAssets(assetData);
    } catch (error) {
      console.error("Failed to load assets", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBranches();
  }, [user?.token]);

  useEffect(() => {
    if (user?.branchId) {
      setSelectedBranchId(String(user.branchId));
    }
  }, [user?.branchId]);

  useEffect(() => {
    void loadData();
  }, [user?.token, user?.businessId, effectiveBranchId]);

  const handleCreate = async (asset: AssetPayload) => {
    if (!user?.token) return;
    setServerError("");

    try {
      await createAsset(asset, user.token);
      setIsDialogOpen(false);
      setSelectedAsset(undefined);
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save asset";
      setServerError(message);
    }
  };

  const handleUpdate = async (asset: AssetPayload) => {
    if (!user?.token || !selectedAsset?.id) return;
    setServerError("");

    try {
      await updateAsset(selectedAsset.id, asset, user.token);
      setIsDialogOpen(false);
      setSelectedAsset(undefined);
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update asset";
      setServerError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.token) return;
    try {
      await deleteAsset(id, user.token);
      await loadData();
    } catch (error) {
      console.error("Failed to delete asset", error);
    }
  };

  const openCategoryDialog = () => {
    setNewCategoryName("");
    setCategoryError("");
    setIsCategoryDialogOpen(true);
  };

  const handleCreateCategory = async () => {
    if (!user?.token || !user?.businessId) return;
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setCategoryError("Category name is required.");
      return;
    }

    setIsCategoryCreating(true);
    setCategoryError("");

    try {
      await createAssetCategory(
        { name: trimmedName, type: "other" },
        user.token,
      );
      setIsCategoryDialogOpen(false);
      setNewCategoryName("");
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create category";
      setCategoryError(message);
    } finally {
      setIsCategoryCreating(false);
    }
  };

  const handleDeleteCategory = (category: AssetCategory) => {
    setCategoryError("");
    setCategoryToDelete(category);
  };

  const confirmDeleteCategory = async () => {
    if (!user?.token || !categoryToDelete) return;
    setCategoryError("");
    const categoryId = categoryToDelete.id || categoryToDelete._id || "";
    if (!categoryId) return;
    setIsCategoryDeleting(categoryId);

    try {
      await deleteAssetCategory(categoryId, user.token);
      setCategoryToDelete(null);
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete category";
      setCategoryError(message);
    } finally {
      setIsCategoryDeleting(null);
    }
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Asset Register
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Record and manage assets across branches and categories.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => setIsDialogOpen(true)}>New Asset</Button>
          <Button
            variant="outline"
            onClick={openCategoryDialog}
            disabled={isCategoryCreating}
          >
            New Category
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Filter assets by branch to keep records scoped to your locations.
          </p>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Branch
          </label>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            disabled={Boolean(user?.branchId)}
          >
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branchName}
              </option>
            ))}
          </select>
          {user?.branchId ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your branch is enforced by your user permissions.
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Asset Categories
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Categories are used to group assets and simplify searches.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={openCategoryDialog}
            disabled={isCategoryCreating}
          >
            Manage Categories
          </Button>
        </div>

        <div className="mt-4 grid gap-2">
          {categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              No categories created yet. Use "Manage Categories" to add one.
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id || category._id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <span>{category.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={
                    isCategoryDeleting === (category.id || category._id)
                  }
                  onClick={() => handleDeleteCategory(category)}
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
        {categoryError ? (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {categoryError}
          </div>
        ) : null}
      </div>

      <AssetTable
        assets={assets}
        categories={categories}
        branches={branches}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <AssetForm
        isOpen={isDialogOpen}
        asset={selectedAsset}
        categories={categories}
        branches={branches}
        defaultBranchId={effectiveBranchId}
        onSubmit={selectedAsset ? handleUpdate : handleCreate}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedAsset(undefined);
        }}
        serverError={serverError}
      />

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={(open) => {
          setIsCategoryDialogOpen(open);
          if (!open) {
            setNewCategoryName("");
            setCategoryError("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Asset Category</DialogTitle>
            <DialogDescription>
              Create a new category for asset registration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Category name
              </label>
              <input
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              {categoryError ? (
                <span className="text-sm text-red-600">{categoryError}</span>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateCategory}
                disabled={isCategoryCreating}
              >
                {isCategoryCreating ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Permanently delete this category and remove it from the asset
              category list.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"? This action cannot be undone.
            </p>
            {categoryError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {categoryError}
              </div>
            ) : null}
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setCategoryToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDeleteCategory}
                disabled={
                  !categoryToDelete ||
                  isCategoryDeleting ===
                    (categoryToDelete.id || categoryToDelete._id)
                }
              >
                Delete Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
