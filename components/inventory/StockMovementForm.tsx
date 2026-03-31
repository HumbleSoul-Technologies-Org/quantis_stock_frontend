"use client";

import { useState, useEffect } from "react";
import { StockMovement, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";

interface StockMovementFormProps {
  products: Product[];
  onSubmit: (movement: StockMovement) => void;
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
    const stored = localStorage.getItem(storageKey);
    counter = stored ? parseInt(stored, 10) : 0;
  }

  // Format as 5-digit number with leading zeros
  const referenceNumber = String(counter).padStart(5, "0");

  // Increment and save for next use
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, String(counter + 1));
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
    type: (initialMovement?.type || "in") as "in" | "out" | "adjustment",
    quantity: initialMovement?.quantity ? String(initialMovement.quantity) : "",
    reason: initialMovement?.reason || "",
    reference: initialMovement?.reference || "",
  });

  const { user } = useAuth();

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
      if (!validateForm()) return;

      const payload = {
        productId: formData.productId,
        type: formData.type,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        reference: formData.reference,
        createdBy: currentUserId,
      };

      let res;
      let endpoint = "/inventory/movement/new";
      let method = "POST";

      if (isEditMode && initialMovement?.id) {
        endpoint = `/inventory/movement/${initialMovement.id}/update`;
        method = "PUT";
      }

      res = await apiRequest(method, endpoint, payload, user?.token);

      if (res.ok) {
        const data: any = await res.json();
        const movementData = isEditMode ? data.movement : data.movement;
        const movement: StockMovement = {
          id: movementData._id || initialMovement?.id,
          productId: formData.productId,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
          reference: formData.reference,
          createdBy: currentUserId,
          createdAt:
            movementData.createdAt ||
            initialMovement?.createdAt ||
            new Date().toISOString(),
        };
        onSubmit(movement);

        // Only reset form in create mode
        if (!isEditMode) {
          setFormData({
            productId: "",
            type: "in",
            quantity: "",
            reason: "",
            reference: "",
          });
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrors({
          general: errorData.message || "Failed to record movement",
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product *
          </label>
          <select
            value={formData.productId}
            onChange={(e) =>
              setFormData({ ...formData, productId: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              errors.productId ? "border-red-500" : "border-green-200"
            }`}
          >
            <option value="">Select product</option>
            {products.map((p) => {
              const productId = p._id || p.id;
              return (
                <option key={productId} value={productId}>
                  {p.name} (Stock: {p.currentStock})
                </option>
              );
            })}
          </select>
          {errors.productId && (
            <p className="text-red-500 text-xs mt-1">{errors.productId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
          >
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
          </label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            placeholder="0"
            className={errors.quantity ? "border-red-500" : "border-green-200"}
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason *
          </label>
          <select
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md text-sm ${
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className={
                isEditMode
                  ? "border-green-200"
                  : "border-green-200 bg-green-50 cursor-not-allowed"
              }
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
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Recording..."
            : isEditMode
              ? "Update Movement"
              : "Record Movement"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
