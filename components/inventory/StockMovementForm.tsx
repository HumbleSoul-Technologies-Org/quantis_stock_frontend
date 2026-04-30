"use client";

import { useState, useEffect, useContext } from "react";
import { StockMovement, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";
import Select from "react-select";
import { ThemeContext } from "@/components/theme-provider";

interface StockMovementFormProps {
  products: Product[];
  onSubmit: (movement: StockMovement) => Promise<void> | void;
  onCancel: () => void;
  currentUserId: string;
  preselectedProductId?: string;
  initialMovement?: StockMovement;
}

// Get and increment the reference counter for a type
function getNextReferenceNumber(type: "in" | "out" | "adjustment"): string {
  const year = new Date().getFullYear();
  const typePrefix = type === "in" ? "SI" : type === "out" ? "SO" : "ADJ";

  // Storage key includes year to reset counters yearly
  const storageKey = `refCounter_${typePrefix}_${year}`;

  // Get current counter from localStorage
  let counter = 0;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(storageKey);
      counter = stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      counter = 0;
    }
  }

  // Format as 5-digit number with leading zeros
  const referenceNumber = String(counter).padStart(5, "0");

  // Increment and save for next use
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(storageKey, String(counter + 1));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  return `${typePrefix}-${year}-${referenceNumber}`;
}

// Generate auto reference number with format: SI-2026-00000, SO-2026-00001, ADJ-2026-00002
function generateReference(type: "in" | "out" | "adjustment"): string {
  return getNextReferenceNumber(type);
}

export function StockMovementForm({
  products,
  onSubmit,
  onCancel,
  currentUserId,
  preselectedProductId,
  initialMovement,
}: StockMovementFormProps) {
  const isEditMode = !!initialMovement;

  const [formData, setFormData] = useState({
    productId: initialMovement?.productId || preselectedProductId || "",
    offline_product_id: initialMovement?.offline_product_id || "",
    offline_id: initialMovement?.offline_id || "",
    type: (initialMovement?.type || "in") as "in" | "out" | "adjustment",
    quantity: initialMovement?.quantity ? String(initialMovement.quantity) : "",
    reason: initialMovement?.reason || "",
    reference: initialMovement?.reference || "",
  });

  const { user } = useAuth();
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  const productOptions = products.map((p) => ({
    value: p.offline_id || p._id || p.id,
    label: `${p.name} (Stock: ${p.currentStock})`,
  }));

  useEffect(() => {
    if (isEditMode) {
      // In edit mode, don't generate new reference
      return;
    }

    if (preselectedProductId) {
      setFormData((prev) => ({ ...prev, productId: preselectedProductId }));
    }
    // Generate reference number on mount and when type changes (only in create mode)
    setFormData((prev) => ({
      ...prev,
      reference: generateReference(prev.type),
    }));
  }, [preselectedProductId, isEditMode]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const movementReasons = {
    in: ["Purchase Order", "Return", "Correction", "Stock Transfer"],
    out: ["Sale", "Damage", "Expiry", "Stock Transfer"],
    adjustment: ["Inventory Count", "Correction", "Write-off"],
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) newErrors.productId = "Product is required";
    if (!formData.quantity || parseInt(formData.quantity) <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    if (!formData.reason) newErrors.reason = "Reason is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      const movement: StockMovement = {
        id: initialMovement?.id || "", // Will be set by the backend for new movements
        offline_id: formData.offline_id || "",
        offline_product_id: formData.offline_product_id || "",
        productId: formData.productId,
        type: formData.type,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        reference: formData.reference,
        createdBy: currentUserId,
        createdAt: initialMovement?.createdAt || new Date().toISOString(),
      };

      await onSubmit(movement);

      // Only reset form in create mode
      if (!isEditMode) {
        setFormData({
          productId: "",
          offline_product_id: "",
          offline_id: "",
          type: "in",
          quantity: "",
          reason: "",
          reference: "",
        });
      }
    } catch (error) {
      console.error("Error recording movement:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium dark:text-slate-300 mb-1">
            Product *
          </label>
          <Select
            value={productOptions.find(
              (option) => option.value === formData.productId,
            )}
            onChange={(selectedOption) =>
              setFormData({
                ...formData,
                productId: selectedOption?.value || "",
              })
            }
            options={productOptions}
            placeholder="Select product"
            className="w-full"
            classNamePrefix="react-select"
            styles={{
              control: (provided, state) => ({
                ...provided,
                border: state.isFocused
                  ? "2px solid rgb(34 197 94)"
                  : errors.productId
                    ? "2px solid rgb(239 68 68)"
                    : "2px solid rgb(34 197 94)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                backgroundColor: theme === "dark" ? "rgb(51 65 85)" : "white",
                color: theme === "dark" ? "rgb(248 250 252)" : "inherit",
                minHeight: "2.5rem",
                boxShadow: state.isFocused
                  ? `0 0 0 3px ${errors.productId ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)"}`
                  : "none",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  borderColor: state.isFocused
                    ? "rgb(34 197 94)"
                    : errors.productId
                      ? "rgb(239 68 68)"
                      : "rgb(34 197 94)",
                },
              }),
              input: (provided) => ({
                ...provided,
                color: theme === "dark" ? "rgb(248 250 252)" : "inherit",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: theme === "dark" ? "rgb(248 250 252)" : "inherit",
              }),
              placeholder: (provided) => ({
                ...provided,
                color:
                  theme === "dark" ? "rgb(148 163 184)" : "rgb(107 114 128)",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: theme === "dark" ? "rgb(51 65 85)" : "white",
                border: "2px solid rgb(34 197 94)",
                borderRadius: "0.375rem",
                marginTop: "0.5rem",
                boxShadow:
                  theme === "dark"
                    ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                    : "0 4px 6px rgba(0, 0, 0, 0.1)",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? "rgb(34 197 94)"
                  : state.isFocused
                    ? theme === "dark"
                      ? "rgb(71 85 105)"
                      : "rgb(243 244 246)"
                    : theme === "dark"
                      ? "rgb(51 65 85)"
                      : "white",
                color: state.isSelected
                  ? "#ffffff"
                  : theme === "dark"
                    ? "rgb(248 250 252)"
                    : "rgb(17 24 39)",
                padding: "10px 12px",
                cursor: "pointer",
                fontWeight: state.isSelected ? "500" : "normal",
                transition: "background-color 0.1s ease, color 0.1s ease",
                "&:active": {
                  backgroundColor: "rgb(22 163 74)",
                },
                "&:hover": {
                  backgroundColor:
                    theme === "dark" ? "rgb(71 85 105)" : "rgb(243 244 246)",
                },
              }),
              indicatorSeparator: (provided) => ({
                ...provided,
                backgroundColor:
                  theme === "dark" ? "rgb(71 85 105)" : "rgb(229 231 235)",
              }),
              dropdownIndicator: (provided, state) => ({
                ...provided,
                color:
                  theme === "dark" ? "rgb(148 163 184)" : "rgb(107 114 128)",
                transition: "color 0.15s ease",
                "&:hover": {
                  color: "rgb(34 197 94)",
                },
              }),
            }}
          />
          {errors.productId && (
            <p className="text-red-500 text-xs mt-1">{errors.productId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-slate-300 mb-1">
            Movement Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => {
              const newType = e.target.value as "in" | "out" | "adjustment";
              setFormData({
                ...formData,
                type: newType,
                reference: isEditMode
                  ? formData.reference
                  : generateReference(newType),
              });
            }}
            className="w-full px-3 py-2 border dark:bg-slate-900 border-green-200 rounded-md text-sm"
          >
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-slate-300 mb-1">
            Quantity *
          </label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            placeholder="0"
            className={`${errors.quantity ? "border-red-500" : "border-green-200"} dark:bg-slate-900 border rounded-md text-sm`}
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-slate-300 mb-1">
            Reason *
          </label>
          <select
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md dark:bg-slate-900 text-sm ${
              errors.reason ? "border-red-500" : "border-green-200"
            }`}
          >
            <option value="">Select reason</option>
            {movementReasons[formData.type].map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          {errors.reason && (
            <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium dark:text-slate-300 mb-1">
            Reference Number *
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={formData.reference}
              onChange={(e) => {
                if (isEditMode) {
                  setFormData({ ...formData, reference: e.target.value });
                }
              }}
              readOnly={!isEditMode}
              placeholder="Auto-generated"
              className={`${
                isEditMode
                  ? "border-green-200"
                  : "border-green-200 bg-green-50 cursor-not-allowed"
              } dark:bg-slate-900 border rounded-md text-sm flex-1 ${errors.reference ? "border-red-500" : ""}`}
            />
          </div>
          {!isEditMode && (
            <p className="text-xs text-gray-500 mt-1">
              Format:{" "}
              {formData.type === "in"
                ? "SI"
                : formData.type === "out"
                  ? "SO"
                  : "ADJ"}
              -{new Date().getFullYear()}-00000 (Auto-incremented)
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner className="h-4 w-4" />
              {isEditMode ? "Updating..." : "Recording..."}
            </>
          ) : isEditMode ? (
            "Update Movement"
          ) : (
            "Record Movement"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="disabled:opacity-50"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
