"use client";

import { useEffect, useState } from "react";
import { Product, Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessConfig } from "@/hooks/useBusinessConfig";
import { useData } from "@/context/DataContext";

interface ManufacturerProductFormProps {
  product?: Product;
  suppliers?: Supplier[];
  categories?: string[];
  onSubmit: (product: Product) => Promise<void> | void;
  onCancel: () => void;
  serverError?: string;
}

const PRODUCT_STAGES = ["Raw Material", "Work in Progress", "Finished Good"];

const PACKAGING_TYPES = [
  "Box",
  "Carton",
  "Bottle",
  "Pouch",
  "Drum",
  "Bag",
  "Other",
];

export function ManufacturerProductForm({
  product,
  suppliers = [],
  categories = [],
  onSubmit,
  onCancel,
  serverError = "",
}: ManufacturerProductFormProps) {
  const { config: businessConfig } = useBusinessConfig();
  const defaultUnits = ["units", "kg", "g", "grammes", "L", "ml", "lbs", "oz"];
  const units = Array.from(
    new Set([...(businessConfig.units || defaultUnits), "g", "grammes"]),
  );
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: "",
      sku: "",
      category: "",
      productType: "",
      productStage: "",
      packagingType: "",
      unit: "units",
      unitPrice: 0,
      costPrice: 0,
      currentStock: 0,
      reorderLevel: 0,
      status: "active",
      description: "",
      supplierId: "",
      isFinishedGood: false,
      bom: [],
    },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    production: true,
    quality: false,
    advanced: false,
  });
  const [bomItems, setBomItems] = useState<
    Array<{ componentId?: string; quantity?: number; unit?: string }>
  >(product?.bom || []);
  const [availableComponents, setAvailableComponents] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const { rawMaterials } = useData();

  const mergedCategories = Array.from(
    new Set([
      ...(categories || []),
      "Raw Material",
      "Work In Progress",
      "Finished Good",
    ]),
  ).sort();

  useEffect(() => {
    setAvailableComponents(
      (rawMaterials || []).map((material) => ({
        id: material._id || material.id || "",
        name: material.name,
      })),
    );
  }, [rawMaterials]);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
      });
      setBomItems(product.bom || []);
    }
  }, [product]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      nextErrors.name = "Product name is required";
    }
    if (!formData.sku?.trim()) {
      nextErrors.sku = "SKU is required";
    }
    if (!formData.category?.trim()) {
      nextErrors.category = "Category is required";
    }
    if (formData.unitPrice == null || Number.isNaN(formData.unitPrice)) {
      nextErrors.unitPrice = "Unit price is required";
    }
    if (formData.costPrice == null || Number.isNaN(formData.costPrice)) {
      nextErrors.costPrice = "Cost price is required";
    }
    if (!formData.supplierId?.trim()) {
      nextErrors.supplierId = "Supplier is required";
    }
    return nextErrors;
  };

  const handleSubmit = async () => {
    setErrors({});
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Product = {
        ...product,
        ...formData,
        supplierId: formData.supplierId || "",
        currentStock: formData.currentStock ?? 0,
        reorderLevel: formData.reorderLevel ?? 0,
        unitPrice: formData.unitPrice ?? 0,
        costPrice: formData.costPrice ?? 0,
        status: formData.status || "active",
        description: formData.description,
        productType: formData.productType,
        productStage: formData.productStage,
        packagingType: formData.packagingType,
        productionLeadTime: formData.productionLeadTime,
        expectedYield: formData.expectedYield,
        productionCostPerUnit: formData.productionCostPerUnit,
        qualityStandard: formData.qualityStandard,
        inspectionRequirements: formData.inspectionRequirements,
        shelfLife: formData.shelfLife,
        storageCondition: formData.storageCondition,
        complianceNotes: formData.complianceNotes,
        batchSize: formData.batchSize,
        machineRequirements: formData.machineRequirements,
        labourRequirement: formData.labourRequirement,
        productionMethod: formData.productionMethod,
        recipe: formData.recipe,
        isFinishedGood: formData.isFinishedGood || false,
        bom: formData.isFinishedGood ? bomItems : undefined,
        image: formData.image,
        branchIds: formData.branchIds,
      } as Product;

      if (!product && !payload.createdAt) {
        payload.createdAt = new Date().toISOString();
      }
      payload.updatedAt = new Date().toISOString();

      await onSubmit(payload);
    } catch (error) {
      console.error("Failed to save manufacturing product:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to save product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateBomItem = (
    index: number,
    key: "componentId" | "quantity" | "unit",
    value: string | number,
  ) => {
    const updated = [...bomItems];
    updated[index] = {
      ...updated[index],
      [key]: key === "quantity" ? Number(value) : value,
    };
    setBomItems(updated);
  };

  return (
    <div className="space-y-6">
      {errors.general && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {errors.general}
        </div>
      )}
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Product Name *
          </label>
          <Input
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Product name"
            className={`${errors.name ? "border-red-500" : "border-green-200 dark:border-teal-700"} dark:bg-slate-700 dark:text-slate-50`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            SKU *
          </label>
          <Input
            value={formData.sku || ""}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="SKU"
            className={`${errors.sku ? "border-red-500" : "border-green-200 dark:border-teal-700"} dark:bg-slate-700 dark:text-slate-50`}
          />
          {errors.sku && (
            <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Product Type
          </label>
          <Input
            value={formData.productType || ""}
            onChange={(e) =>
              setFormData({ ...formData, productType: e.target.value })
            }
            placeholder="Food and beverages, Electronics, etc."
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Category *
          </label>
          <select
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className={`${errors.category ? "border-red-500" : "border-green-200 dark:border-teal-700"} w-full px-3 py-2 rounded-md text-sm dark:bg-slate-700 dark:text-slate-50`}
          >
            <option value="">Select category</option>
            {mergedCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Supplier *
          </label>
          <select
            value={formData.supplierId || ""}
            onChange={(e) =>
              setFormData({ ...formData, supplierId: e.target.value })
            }
            className={`${errors.supplierId ? "border-red-500" : "border-green-200 dark:border-teal-700"} w-full px-3 py-2 rounded-md text-sm dark:bg-slate-700 dark:text-slate-50`}
          >
            <option value="">Select supplier</option>
            {suppliers?.map((supplier) => (
              <option
                key={supplier.id || supplier._id}
                value={supplier.id || supplier._id}
              >
                {supplier.name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="text-red-500 text-xs mt-1">{errors.supplierId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Product Stage
          </label>
          <select
            value={formData.productStage || ""}
            onChange={(e) =>
              setFormData({ ...formData, productStage: e.target.value })
            }
            className="w-full px-3 py-2 rounded-md text-sm border border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          >
            <option value="">Select product stage</option>
            {PRODUCT_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Packaging Type
          </label>
          <select
            value={formData.packagingType || ""}
            onChange={(e) =>
              setFormData({ ...formData, packagingType: e.target.value })
            }
            className="w-full px-3 py-2 rounded-md text-sm border border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          >
            <option value="">Select packaging type</option>
            {PACKAGING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Unit *
          </label>
          <Input
            value={formData.unit || "units"}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="kg, litre, units"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Unit Price *
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.unitPrice ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, unitPrice: Number(e.target.value) })
            }
            placeholder="0.00"
            className={`${errors.unitPrice ? "border-red-500" : "border-green-200 dark:border-teal-700"} dark:bg-slate-700 dark:text-slate-50`}
          />
          {errors.unitPrice && (
            <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Cost Price *
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.costPrice ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, costPrice: Number(e.target.value) })
            }
            placeholder="0.00"
            className={`${errors.costPrice ? "border-red-500" : "border-green-200 dark:border-teal-700"} dark:bg-slate-700 dark:text-slate-50`}
          />
          {errors.costPrice && (
            <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Current Stock
          </label>
          <Input
            type="number"
            value={formData.currentStock ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, currentStock: Number(e.target.value) })
            }
            placeholder="0"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Reorder Level
          </label>
          <Input
            type="number"
            value={formData.reorderLevel ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, reorderLevel: Number(e.target.value) })
            }
            placeholder="0"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-teal-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Production Setup
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Manufacturing-specific production and costing fields.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSection("production")}
            className="text-sm text-green-600 dark:text-teal-400"
          >
            {expandedSections.production ? "Hide" : "Show"}
          </button>
        </div>

        {expandedSections.production ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Production Lead Time
              </label>
              <Input
                type="number"
                value={formData.productionLeadTime ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productionLeadTime: Number(e.target.value),
                  })
                }
                placeholder="Days"
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Expected Yield
              </label>
              <Input
                type="number"
                value={formData.expectedYield ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expectedYield: Number(e.target.value),
                  })
                }
                placeholder="Units per run"
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Production Cost per Unit
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.productionCostPerUnit ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productionCostPerUnit: Number(e.target.value),
                  })
                }
                placeholder="0.00"
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Production Method
              </label>
              <Input
                value={formData.productionMethod || ""}
                onChange={(e) =>
                  setFormData({ ...formData, productionMethod: e.target.value })
                }
                placeholder="Batch, continuous, assembly, etc."
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Batch Size
              </label>
              <Input
                type="number"
                value={formData.batchSize ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    batchSize: Number(e.target.value),
                  })
                }
                placeholder="Units per batch"
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Machine Requirements
              </label>
              <Input
                value={formData.machineRequirements || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    machineRequirements: e.target.value,
                  })
                }
                placeholder="Machines or equipment required"
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Labour Requirement
              </label>
              <Input
                value={formData.labourRequirement || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    labourRequirement: e.target.value,
                  })
                }
                placeholder="Labour needed per batch"
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-teal-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Quality & Compliance
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Capture quality and storage requirements.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSection("quality")}
            className="text-sm text-green-600 dark:text-teal-400"
          >
            {expandedSections.quality ? "Hide" : "Show"}
          </button>
        </div>

        {expandedSections.quality ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Quality Standard
              </label>
              <Input
                value={formData.qualityStandard || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qualityStandard: e.target.value,
                  })
                }
                placeholder="ISO, HACCP, GMP, etc."
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Inspection Requirements
              </label>
              <Input
                value={formData.inspectionRequirements || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inspectionRequirements: e.target.value,
                  })
                }
                placeholder="Required inspections or checks"
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Shelf Life
              </label>
              <Input
                value={formData.shelfLife || ""}
                onChange={(e) =>
                  setFormData({ ...formData, shelfLife: e.target.value })
                }
                placeholder="3 months, 2 years, etc."
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Compliance Notes
              </label>
              <Textarea
                value={formData.complianceNotes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, complianceNotes: e.target.value })
                }
                placeholder="Any compliance or inspection notes"
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Recipe / Formula
              </label>
              <Textarea
                value={formData.recipe || ""}
                onChange={(e) =>
                  setFormData({ ...formData, recipe: e.target.value })
                }
                placeholder="Recipe, formula, or process notes"
                className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-teal-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Production Materials
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Define finished goods and bill of materials.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleSection("advanced")}
            className="text-sm text-green-600 dark:text-teal-400"
          >
            {expandedSections.advanced ? "Hide" : "Show"}
          </button>
        </div>

        {expandedSections.advanced ? (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={formData.isFinishedGood || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isFinishedGood: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-green-300 text-green-600"
              />
              Finished Good (has BOM)
            </label>

            {formData.isFinishedGood && (
              <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-teal-700">
                {bomItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-3 items-end">
                    <div className="col-span-3">
                      <label className="text-xs text-gray-700 dark:text-slate-300 block mb-1">
                        Component
                      </label>
                      <select
                        value={item.componentId || ""}
                        onChange={(e) =>
                          updateBomItem(idx, "componentId", e.target.value)
                        }
                        className="w-full px-2 py-2 rounded border border-green-200 dark:border-teal-700 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-slate-50"
                      >
                        <option value="">Select component</option>
                        {availableComponents.map((component) => (
                          <option key={component.id} value={component.id}>
                            {component.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-700 dark:text-slate-300 block mb-1">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        value={item.quantity ?? ""}
                        onChange={(e) =>
                          updateBomItem(idx, "quantity", e.target.value)
                        }
                        className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs text-gray-700 dark:text-slate-300 block mb-1">
                        Unit
                      </label>
                      <Select
                        value={item.unit ?? ""}
                        onValueChange={(value) =>
                          updateBomItem(idx, "unit", value)
                        }
                      >
                        <SelectTrigger
                          className="w-full"
                          id={`bom-unit-${idx}`}
                        >
                          <SelectValue
                            placeholder={formData.unit || "Select unit"}
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-52">
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setBomItems(bomItems.filter((_, i) => i !== idx))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={() =>
                    setBomItems([
                      ...bomItems,
                      { quantity: 1, unit: formData.unit || "units" },
                    ])
                  }
                >
                  Add BOM Component
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-teal-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <Textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Detailed description"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Manufacturing Product"}
        </Button>
      </div>
    </div>
  );
}
