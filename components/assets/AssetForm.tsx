"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Asset, AssetCategory, AssetPayload, Branch } from "@/lib/types";

interface AssetFormProps {
  isOpen: boolean;
  asset?: Asset;
  categories: AssetCategory[];
  branches: Branch[];
  defaultBranchId?: string;
  onSubmit: (asset: AssetPayload) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  serverError?: string;
}

const defaultAssetState: AssetPayload = {
  categoryId: "",
  name: "",
  assetType: "other",
  acquisitionDate: new Date().toISOString().slice(0, 10),
  acquisitionCost: 0,
  status: "inUse",
};

export function AssetForm({
  isOpen,
  asset,
  categories,
  branches,
  defaultBranchId,
  onSubmit,
  onOpenChange,
  serverError = "",
}: AssetFormProps) {
  const [formData, setFormData] = useState<AssetPayload>(() => ({
    ...defaultAssetState,
    branchId: asset?.branchId ?? defaultBranchId,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(
      asset
        ? {
            branchId: asset.branchId || undefined,
            categoryId: asset.categoryId,
            name: asset.name,
            description: asset.description,
            code: asset.code,
            assetType: asset.assetType,
            acquisitionDate: asset.acquisitionDate,
            acquisitionCost: asset.acquisitionCost,
            currentValue: asset.currentValue,
            depreciationMethod: asset.depreciationMethod,
            usefulLifeYears: asset.usefulLifeYears,
            status: asset.status,
            location: asset.location,
            custodianId: asset.custodianId,
            purchaseInvoiceRef: asset.purchaseInvoiceRef,
          }
        : {
            ...defaultAssetState,
            branchId: defaultBranchId,
          },
    );
    setErrors({});
  }, [asset, isOpen, defaultBranchId]);

  const handleChange = (field: keyof AssetPayload, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Asset name is required";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    if (!formData.acquisitionDate) {
      newErrors.acquisitionDate = "Acquisition date is required";
    }
    if (!formData.acquisitionCost || Number(formData.acquisitionCost) < 0) {
      newErrors.acquisitionCost = "Acquisition cost must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "New Asset"}</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Asset Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name ? (
              <span className="text-sm text-red-600">{errors.name}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Category
            </label>
            <select
              className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={formData.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option
                  key={category.id || category._id}
                  value={category.id || category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <span className="text-sm text-red-600">{errors.categoryId}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Branch
            </label>
            <select
              className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={formData.branchId || ""}
              onChange={(e) => handleChange("branchId", e.target.value)}
            >
              <option value="">Select branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName || branch.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Asset Type
            </label>
            <select
              className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={formData.assetType}
              onChange={(e) => handleChange("assetType", e.target.value)}
            >
              <option value="property">Property</option>
              <option value="equipment">Equipment</option>
              <option value="vehicle">Vehicle</option>
              <option value="furniture">Furniture</option>
              <option value="tool">Tool</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Acquisition Date
              </label>
              <Input
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) =>
                  handleChange("acquisitionDate", e.target.value)
                }
              />
              {errors.acquisitionDate ? (
                <span className="text-sm text-red-600">
                  {errors.acquisitionDate}
                </span>
              ) : null}
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Acquisition Cost
              </label>
              <Input
                type="number"
                value={formData.acquisitionCost?.toString() || ""}
                onChange={(e) =>
                  handleChange("acquisitionCost", Number(e.target.value))
                }
              />
              {errors.acquisitionCost ? (
                <span className="text-sm text-red-600">
                  {errors.acquisitionCost}
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>
            <select
              className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="inUse">In Use</option>
              <option value="stored">Stored</option>
              <option value="maintenance">Maintenance</option>
              <option value="disposed">Disposed</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Location
            </label>
            <Input
              value={formData.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Description
            </label>
            <Input
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Purchase Invoice Reference
              </label>
              <Input
                value={formData.purchaseInvoiceRef || ""}
                onChange={(e) =>
                  handleChange("purchaseInvoiceRef", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Asset Code
              </label>
              <Input
                value={formData.code || ""}
                onChange={(e) => handleChange("code", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Depreciation Method
              </label>
              <select
                className="rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-ring focus:ring-ring/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={formData.depreciationMethod || "none"}
                onChange={(e) =>
                  handleChange("depreciationMethod", e.target.value)
                }
              >
                <option value="none">None</option>
                <option value="straightLine">Straight Line</option>
                <option value="reducingBalance">Reducing Balance</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Useful Life Years
              </label>
              <Input
                type="number"
                value={formData.usefulLifeYears?.toString() || ""}
                onChange={(e) =>
                  handleChange("usefulLifeYears", Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {asset ? "Update Asset" : "Create Asset"}
            </Button>
          </div>

          {serverError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {serverError}
            </div>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
