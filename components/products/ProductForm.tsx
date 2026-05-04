"use client";

import { useState, useEffect } from "react";
import { Product, Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { uploadImage } from "@/lib/cloudinary";
import { useBusinessConfig } from "@/hooks/useBusinessConfig";
import {
  getFieldSchemaForCategory,
  FieldDefinition,
} from "@/lib/business-config";

import { useAuth } from "@/context/AuthContext";

interface ProductFormProps {
  product?: Product;
  suppliers: Supplier[];
  categories?: string[];
  onSubmit: (product: Product) => Promise<void> | void;
  onCancel: () => void;
}

export function ProductForm({
  product,
  suppliers,
  categories = [],
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { config: businessConfig, retailSubType } = useBusinessConfig();
  const { user } = useAuth();
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
      retailSubType: retailSubType,
      imageUrl: "",
      image: {
        url: "",
        public_id: "",
      },
    },
  );

  const [imagePreview, setImagePreview] = useState<string>(
    product?.imageUrl || product?.image?.url || "",
  );
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    categoryFields: false,
  });

  // Category-specific field state
  const [categoryFields, setCategoryFields] = useState<Record<string, any>>(
    product?.customAttributes || {},
  );

  // Custom category and attributes for "Other" category
  const [customCategory, setCustomCategory] = useState<string>(
    product?.customCategory || "",
  );
  const [customAttributesList, setCustomAttributesList] = useState<
    Array<{ title: string; value: string }>
  >(
    product?.customAttributes
      ? Object.entries(product.customAttributes).map(([title, value]) => ({
          title,
          value: String(value),
        }))
      : [{ title: "", value: "" }],
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    setUploadedImage(file.name);

    try {
      const uploadResult = await uploadImage(file);
      setFormData({
        ...formData,
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
      });
      setImagePreview(uploadResult.secure_url);
    } catch (error) {
      console.error("Image upload failed", error);
    } finally {
      setIsImageUploading(false);
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

  const updateCategoryField = (key: string, value: any) => {
    setCategoryFields({
      ...categoryFields,
      [key]: value,
    });
  };

  // Custom attribute handlers for "Other" category
  const addCustomAttribute = () => {
    setCustomAttributesList([
      ...customAttributesList,
      { title: "", value: "" },
    ]);
  };

  const removeCustomAttribute = (index: number) => {
    setCustomAttributesList(customAttributesList.filter((_, i) => i !== index));
  };

  const updateCustomAttribute = (
    index: number,
    field: "title" | "value",
    value: string,
  ) => {
    const updated = [...customAttributesList];
    updated[index][field] = value;
    setCustomAttributesList(updated);
  };

  // Auto-expand category fields when category is selected
  useEffect(() => {
    if (formData.category) {
      setExpandedSections({
        ...expandedSections,
        categoryFields: true,
      });
    }
  }, [formData.category]);

  // Initialize custom category and attributes when editing existing product
  useEffect(() => {
    if (product && product.customCategory) {
      setFormData((prev) => ({ ...prev, category: "Other" }));
      setCustomCategory(product.customCategory);
    }
    if (
      product &&
      product.customAttributes &&
      Object.keys(product.customAttributes).length > 0
    ) {
      const attrList = Object.entries(product.customAttributes).map(
        ([title, value]) => ({
          title,
          value: String(value),
        }),
      );
      if (attrList.length > 0) {
        setCustomAttributesList(attrList);
      }
    }
  }, [product]);

  // Ensure image data is preserved when editing existing product
  useEffect(() => {
    if (product && !uploadedImage) {
      setFormData((prev) => ({
        ...prev,
        imageUrl: product.imageUrl || prev.imageUrl,
        imagePublicId: product.imagePublicId || prev.imagePublicId,
      }));
    }
  }, [product?.id]);

  // Generic field renderer for any field type
  const renderField = (fieldDef: FieldDefinition) => {
    const value = categoryFields[fieldDef.key] || "";
    const containerClass = fieldDef.fullWidth ? "md:col-span-2" : "";

    switch (fieldDef.type) {
      case "text":
        return (
          <div key={fieldDef.key} className={containerClass}>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {fieldDef.label}
            </label>
            <Input
              value={value}
              onChange={(e) =>
                updateCategoryField(fieldDef.key, e.target.value)
              }
              placeholder={fieldDef.placeholder}
              className="border-gray-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            />
          </div>
        );

      case "date":
        return (
          <div key={fieldDef.key} className={containerClass}>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {fieldDef.label}
            </label>
            <Input
              type="date"
              value={value?.split("T")[0] || ""}
              onChange={(e) =>
                updateCategoryField(fieldDef.key, e.target.value)
              }
              className="border-gray-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={fieldDef.key} className={containerClass}>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {fieldDef.label}
            </label>
            <textarea
              value={value}
              onChange={(e) =>
                updateCategoryField(fieldDef.key, e.target.value)
              }
              placeholder={fieldDef.placeholder}
              rows={fieldDef.rows || 2}
              className="w-full px-3 py-2 border border-gray-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50 rounded-md text-sm"
            />
          </div>
        );

      case "select":
        return (
          <div key={fieldDef.key} className={containerClass}>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              {fieldDef.label}
            </label>
            <select
              value={value}
              onChange={(e) =>
                updateCategoryField(fieldDef.key, e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50 rounded-md text-sm"
            >
              <option value="">Select...</option>
              {fieldDef.options?.map((opt) => (
                <option key={opt} value={opt.toLowerCase()}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );

      case "checkbox":
        return (
          <div key={fieldDef.key} className={containerClass}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={value === true || value === "true"}
                onChange={(e) =>
                  updateCategoryField(fieldDef.key, e.target.checked)
                }
                className="rounded border-gray-300 dark:border-teal-700"
              />
              {fieldDef.label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Render category-specific fields based on selected category
  const renderCategoryFields = () => {
    // Special handling for "Other" category - show custom attributes
    if (formData.category === "Other") {
      return (
        <div className="space-y-3 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-teal-700">
          <h4 className="font-medium text-gray-700 dark:text-slate-300">
            Custom Attributes
          </h4>
          <div className="space-y-3">
            {customAttributesList.map((attr, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Title
                  </label>
                  <Input
                    value={attr.title}
                    onChange={(e) =>
                      updateCustomAttribute(index, "title", e.target.value)
                    }
                    placeholder="e.g., Warranty Period"
                    className="border-gray-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Value
                  </label>
                  <Input
                    value={attr.value}
                    onChange={(e) =>
                      updateCustomAttribute(index, "value", e.target.value)
                    }
                    placeholder="e.g., 2 years"
                    className="border-gray-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeCustomAttribute(index)}
                  disabled={customAttributesList.length === 1}
                  className="px-2 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                >
                  ×
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={addCustomAttribute}
              className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
            >
              Add Custom Field
            </Button>
          </div>
        </div>
      );
    }

    const schema = getFieldSchemaForCategory(formData.category || "");

    if (!schema) return null;

    return (
      <div className="space-y-3 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg border border-gray-200 dark:border-teal-700">
        <h4 className="font-medium text-gray-700 dark:text-slate-300">
          {schema.name}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {schema.fields.map((field) => renderField(field))}
        </div>
      </div>
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.sku?.trim()) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.category === "Other" && !customCategory.trim()) {
      newErrors.customCategory = "Custom category name is required";
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    let res = null;
    try {
      // Ensure supplierId is always trimmed to a valid supplier ID
      const selectedSupplier = suppliers.find(
        (s) =>
          s.name === formData.supplierId ||
          s.offline_id === formData.supplierId ||
          s.id === formData.supplierId ||
          s._id === formData.supplierId,
      );

      const selectedSupplierId =
        selectedSupplier?.id ||
        selectedSupplier?._id ||
        formData.supplierId ||
        "";

      const payLoad = {
        name: formData.name || "",
        sku: formData.sku || "",
        category: formData.category || "",
        customCategory:
          formData.category === "Other" ? customCategory : undefined,
        unitPrice: formData.unitPrice || 0,
        costPrice: formData.costPrice || 0,
        unit: formData.unit || "units",
        supplierId: formData.supplierId || "",
        reorderLevel: formData.reorderLevel || 10,
        currentStock: formData.currentStock ?? product?.currentStock ?? 0,

        retailSubType: formData.retailSubType || retailSubType,

        // Optional new fields (backward compatible)
        status: (formData.status as "active" | "discontinued") || "active",
        description: formData.description,
        baseUoM: formData.baseUoM || formData.unit,
        alternateUoMs: formData.alternateUoMs,
        tracking: formData.tracking,
        suppliers: formData.suppliers,
        reorderStrategy: formData.reorderStrategy,
        warehouseLocations: formData.warehouseLocations,
        customAttributes:
          formData.category === "Other"
            ? customAttributesList.reduce(
                (acc, attr) => {
                  if (attr.title.trim()) {
                    acc[attr.title.trim()] = attr.value;
                  }
                  return acc;
                },
                {} as Record<string, string>,
              )
            : categoryFields,
        discontinuedDate: formData.discontinuedDate,
        discontinuationReason: formData.discontinuationReason,
        // Preserve existing image if no new image was uploaded
        image: {
          url:
            formData.imageUrl || product?.imageUrl || product?.image?.url || "",
          public_id:
            formData.imagePublicId ||
            product?.imagePublicId ||
            product?.image?.public_id ||
            "",
        },
      };

      if ((product && product.id) || product?._id) {
        // For updates, create the updated product object
        const updatedProduct: Product = {
          ...product,
          ...payLoad,
          id: product.id || product._id || "",
          updatedAt: new Date().toISOString(),
        };
        await onSubmit(updatedProduct);
      } else {
        // For new products, create the product object
        const newProduct: Product = {
          ...payLoad,
          // Will be set by the backend
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await onSubmit(newProduct);
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      setErrors({ general: "Failed to save product. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <ChevronDown className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
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
            placeholder="e.g., Laptop Computer"
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
            placeholder="e.g., LAP-001"
            className={`${errors.sku ? "border-red-500" : "border-green-200 dark:border-teal-700"} dark:bg-slate-700 dark:text-slate-50`}
          />
          {errors.sku && (
            <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isSubmitting}
            className="hidden"
            id="product-image-upload"
          />
          <button
            type="button"
            onClick={() =>
              !isSubmitting &&
              document.getElementById("product-image-upload")?.click()
            }
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md border border-green-200 px-4 py-2 text-sm font-medium text-green-700 dark:text-teal-100 bg-white dark:bg-slate-700 hover:bg-green-50 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!!imagePreview ? "Choose Image" : "Change Image"}
          </button>
          {uploadedImage && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Selected: {uploadedImage}
            </p>
          )}
          {isImageUploading && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Uploading image...
            </p>
          )}
          {imagePreview && (
            <div className="mt-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Preview:
              </p>
              <img
                src={imagePreview}
                alt="Product preview"
                className="mt-1 h-24 w-24 object-cover rounded border dark:border-teal-700"
              />
            </div>
          )}
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
            className={`w-full px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:text-slate-50 ${
              errors.category
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700"
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

        {/* Custom Category Input - shown when "Other" is selected */}
        {formData.category === "Other" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Custom Category Name *
            </label>
            <Input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="e.g., Agricultural Equipment"
              className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Supplier *
          </label>
          <select
            value={formData.supplierId || ""}
            onChange={(e) =>
              setFormData({ ...formData, supplierId: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:text-slate-50 ${
              errors.supplierId
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700"
            }`}
          >
            <option value="">Select supplier</option>
            {suppliers.map((supplier, index) => (
              <option key={index} value={supplier.id || supplier._id}>
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
            className={`${errors.unitPrice ? "border-red-500" : "border-green-200 dark:border-teal-700"} dark:bg-slate-700 dark:text-slate-50`}
          />
          {errors.unitPrice && (
            <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
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
            className={`${errors.costPrice ? "border-red-500" : "border-green-200 dark:border-teal-700"} dark:bg-slate-700 dark:text-slate-50`}
          />
          {errors.costPrice && (
            <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Unit
          </label>
          <select
            value={formData.unit || "units"}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 border border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50 rounded-md text-sm"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
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
            className={`${
              errors.reorderLevel
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700"
            } dark:bg-slate-700 dark:text-slate-50`}
          />
          {errors.reorderLevel && (
            <p className="text-red-500 text-xs mt-1">{errors.reorderLevel}</p>
          )}
        </div>
      </div>

      {/* Category-Specific Fields */}
      {formData.category && (
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-teal-700">
          <div className="border border-gray-200 dark:border-teal-700 rounded-lg dark:bg-slate-700">
            <button
              type="button"
              onClick={() => toggleSection("categoryFields")}
              className="w-full flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-600"
            >
              <span className="font-medium text-gray-700 dark:text-slate-300">
                Category-Specific Fields
              </span>
              {expandedSections.categoryFields ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections.categoryFields && (
              <div className="p-3 border-t border-gray-200 dark:border-teal-700">
                {renderCategoryFields()}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          {isSubmitting ? (
            <>
              <Spinner className="h-4 w-4" />
              {product ? "Updating Product..." : "Adding Product..."}
            </>
          ) : product ? (
            "Update Product"
          ) : (
            "Add Product"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
