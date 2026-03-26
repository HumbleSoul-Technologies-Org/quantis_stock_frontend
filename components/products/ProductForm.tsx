"use client";

import { useState } from "react";
import {
  Product,
  Supplier,
  UnitOfMeasure,
  SupplierInfo,
  TrackingConfig,
  ReorderStrategy,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useBusinessConfig } from "@/hooks/useBusinessConfig";

interface ProductFormProps {
  product?: Product;
  suppliers: Supplier[];
  categories?: string[];
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

export function ProductForm({
  product,
  suppliers,
  categories = [],
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { config: businessConfig } = useBusinessConfig();
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: "",
      sku: "",
      category: "",
      unitPrice: 0,
      costPrice: 0,
      unit: "units",
      supplierId: "",
      reorderLevel: 10,
      currentStock: 0,
      status: "active",
    },
  );

  const [model, setModel] = useState(product?.["model"] || "");
  const [brand, setBrand] = useState(product?.["brand"] || "");
  const [size, setSize] = useState(product?.["size"] || "");
  const [color, setColor] = useState(product?.["color"] || "");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    advanced: false,
    tracking: false,
    suppliers: false,
    reorderStrategy: false,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setUploadedImage(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const units = businessConfig.units;
  const defaultCategories = businessConfig.categories;
  const mergedCategories = Array.from(
    new Set([...categories, ...defaultCategories]),
  ).sort();

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.sku?.trim()) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if ((formData.unitPrice || 0) <= 0)
      newErrors.unitPrice = "Unit price must be greater than 0";
    if ((formData.costPrice || 0) < 0)
      newErrors.costPrice = "Cost price must be 0 or greater";
    if (!formData.supplierId) newErrors.supplierId = "Supplier is required";
    if ((formData.reorderLevel || 0) < 0)
      newErrors.reorderLevel = "Reorder level must be 0 or greater";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newProduct: Product = {
      id: product?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name || "",
      sku: formData.sku || "",
      category: formData.category || "",
      unitPrice: formData.unitPrice || 0,
      costPrice: formData.costPrice || 0,
      unit: formData.unit || "units",
      supplierId: formData.supplierId || "",
      reorderLevel: formData.reorderLevel || 10,
      currentStock: formData.currentStock ?? product?.currentStock ?? 0,
      createdAt: product?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Optional new fields (backward compatible)
      status: (formData.status as "active" | "discontinued") || "active",
      description: formData.description,
      baseUoM: formData.baseUoM || formData.unit,
      alternateUoMs: formData.alternateUoMs,
      tracking: formData.tracking,
      suppliers: formData.suppliers,
      reorderStrategy: formData.reorderStrategy,
      warehouseLocations: formData.warehouseLocations,
      customAttributes: formData.customAttributes,
      discontinuedDate: formData.discontinuedDate,
      discontinuationReason: formData.discontinuationReason,
    };

    onSubmit(newProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <Input
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Laptop Computer"
            className={errors.name ? "border-red-500" : "border-green-200"}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU *
          </label>
          <Input
            value={formData.sku || ""}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="e.g., LAP-001"
            className={errors.sku ? "border-red-500" : "border-green-200"}
          />
          {errors.sku && (
            <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              errors.category ? "border-red-500" : "border-green-200"
            }`}
          >
            <option value="">Select category</option>
            {mergedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier *
          </label>
          <select
            value={formData.supplierId || ""}
            onChange={(e) =>
              setFormData({ ...formData, supplierId: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              errors.supplierId ? "border-red-500" : "border-green-200"
            }`}
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="text-red-500 text-xs mt-1">{errors.supplierId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Price *
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.unitPrice || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                unitPrice: parseFloat(e.target.value),
              })
            }
            placeholder="0.00"
            className={errors.unitPrice ? "border-red-500" : "border-green-200"}
          />
          {errors.unitPrice && (
            <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Price
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.costPrice || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                costPrice: parseFloat(e.target.value),
              })
            }
            placeholder="0.00"
            className={errors.costPrice ? "border-red-500" : "border-green-200"}
          />
          {errors.costPrice && (
            <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <select
            value={formData.unit || "units"}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reorder Level
          </label>
          <Input
            type="number"
            value={formData.reorderLevel || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                reorderLevel: parseInt(e.target.value),
              })
            }
            placeholder="0"
            className={
              errors.reorderLevel ? "border-red-500" : "border-green-200"
            }
          />
          {errors.reorderLevel && (
            <p className="text-red-500 text-xs mt-1">{errors.reorderLevel}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <Input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Dell, Apple, Lenovo"
            className="border-green-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g., ThinkPad X1, MacBook Pro"
            className="border-green-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <Input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="e.g., 15 inch, Large"
            className="border-green-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g., Silver, Space Gray"
            className="border-green-200"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border-green-200 cursor-pointer"
          />
          {uploadedImage && (
            <p className="text-xs text-green-600 mt-1">
              Uploaded: {uploadedImage}
            </p>
          )}
        </div>

        {imagePreview && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </label>
            <img
              src={imagePreview}
              alt="Product preview"
              className="w-32 h-32 object-cover border border-green-200 rounded"
            />
          </div>
        )}
      </div>

      {/* Advanced Settings Sections */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        {/* Product Status & Description */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("advanced")}
            className="w-full flex justify-between items-center p-3 hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">General Settings</span>
            {expandedSections.advanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.advanced && (
            <div className="p-3 border-t border-gray-200 space-y-3 bg-gray-50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || "active"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "discontinued",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="active">Active</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Product description..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                  rows={3}
                />
              </div>

              {formData.status === "discontinued" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discontinuation Date
                    </label>
                    <Input
                      type="date"
                      value={formData.discontinuedDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discontinuedDate: e.target.value,
                        })
                      }
                      className="border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Discontinuation
                    </label>
                    <Input
                      value={formData.discontinuationReason || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discontinuationReason: e.target.value,
                        })
                      }
                      placeholder="e.g., Replaced by new model"
                      className="border-gray-200"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Tracking Configuration */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("tracking")}
            className="w-full flex justify-between items-center p-3 hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">
              Tracking Configuration
            </span>
            {expandedSections.tracking ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.tracking && (
            <div className="p-3 border-t border-gray-200 space-y-3 bg-gray-50">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.tracking?.trackByBatch || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tracking: {
                        ...formData.tracking,
                        trackByBatch: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Track by Batch Number
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.tracking?.trackBySerial || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tracking: {
                        ...formData.tracking,
                        trackBySerial: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Track by Serial Number
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.tracking?.requireExpiryDate || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tracking: {
                        ...formData.tracking,
                        requireExpiryDate: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Require Expiry Date
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Reorder Strategy */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("reorderStrategy")}
            className="w-full flex justify-between items-center p-3 hover:bg-gray-50"
          >
            <span className="font-medium text-gray-700">
              Advanced Reorder Strategy
            </span>
            {expandedSections.reorderStrategy ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.reorderStrategy && (
            <div className="p-3 border-t border-gray-200 space-y-3 bg-gray-50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Strategy Type
                </label>
                <select
                  value={formData.reorderStrategy?.type || "fixed"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorderStrategy: {
                        ...formData.reorderStrategy,
                        type: e.target.value as
                          | "fixed"
                          | "seasonal"
                          | "automated",
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="fixed">Fixed Level</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="automated">Automated</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Safety Stock
                  </label>
                  <Input
                    type="number"
                    value={formData.reorderStrategy?.safetyStock || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reorderStrategy: {
                          ...formData.reorderStrategy,
                          safetyStock: parseInt(e.target.value),
                        },
                      })
                    }
                    placeholder="e.g., 5"
                    className="border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Time (days)
                  </label>
                  <Input
                    type="number"
                    value={formData.reorderStrategy?.leadTimeDays || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reorderStrategy: {
                          ...formData.reorderStrategy,
                          leadTimeDays: parseInt(e.target.value),
                        },
                      })
                    }
                    placeholder="e.g., 7"
                    className="border-gray-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Economic Order Quantity
                </label>
                <Input
                  type="number"
                  value={formData.reorderStrategy?.economicOrderQuantity || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorderStrategy: {
                        ...formData.reorderStrategy,
                        economicOrderQuantity: parseInt(e.target.value),
                      },
                    })
                  }
                  placeholder="e.g., 50"
                  className="border-gray-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {product ? "Update Product" : "Add Product"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
