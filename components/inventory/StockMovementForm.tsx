"use client";

import { useState, useEffect } from "react";
import { StockMovement, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";

interface StockMovementFormProps {
  products: Product[];
  onSubmit: (movement: StockMovement) => void;
  onCancel: () => void;
  currentUserId: string;
  preselectedProductId?: string;
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
}: StockMovementFormProps) {
  const [formData, setFormData] = useState({
    productId: preselectedProductId || "",
    type: "in" as "in" | "out" | "adjustment",
    quantity: "",
    reason: "",
    reference: "",
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (preselectedProductId) {
      setFormData((prev) => ({ ...prev, productId: preselectedProductId }));
    }
    // Generate reference number on mount and when type changes
    setFormData((prev) => ({
      ...prev,
      reference: generateReference(prev.type),
    }));
  }, [preselectedProductId]);

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const movement: StockMovement = {
      id: Math.random().toString(36).substr(2, 9),
      productId: formData.productId,
      type: formData.type,
      quantity: parseInt(formData.quantity),
      reason: formData.reason,
      reference: formData.reference,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
    };

    onSubmit(movement);
    setFormData({
      productId: "",
      type: "in",
      quantity: "",
      reason: "",
      reference: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Stock: {p.currentStock})
              </option>
            ))}
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
                reference: generateReference(newType),
              });
              setCopied(false);
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
              readOnly
              placeholder="Auto-generated"
              className="border-green-200 bg-green-50 cursor-not-allowed"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(formData.reference);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 gap-1.5 whitespace-nowrap"
              title="Copy reference number"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Format:{" "}
            {formData.type === "in"
              ? "SI"
              : formData.type === "out"
                ? "SO"
                : "ADJ"}
            -{new Date().getFullYear()}-00000 (Auto-incremented)
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Record Movement
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
