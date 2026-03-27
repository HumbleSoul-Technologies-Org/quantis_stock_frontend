"use client";

import { useState } from "react";
import { Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (supplier: Supplier) => void;
  onCancel: () => void;
}

export function SupplierForm({
  supplier,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>(
    supplier || {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      paymentTerms: "",
      website: "",
    },
  );

  const [productsSupplied, setProductsSupplied] = useState(
    supplier?.name || "",
  );
  const [supplyContact, setSupplyContact] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.country?.trim()) newErrors.country = "Country is required";
    if (!productsSupplied.trim())
      newErrors.productsSupplied = "Products supplied is required";
    if (!supplyContact.trim())
      newErrors.supplyContact = "Supply contact name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newSupplier: Supplier = {
      id: supplier?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name || "",
      email: formData.email || "",
      phone: formData.phone || "",
      address: formData.address || "",
      city: formData.city || "",
      country: formData.country || "",
      paymentTerms: formData.paymentTerms || "",
      website: formData.website || "",
      createdAt: supplier?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newSupplier);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Supplier Name *
          </label>
          <Input
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Tech World Supplies"
            className={
              errors.name
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Email *
          </label>
          <Input
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="email@example.com"
            className={
              errors.email
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Phone *
          </label>
          <Input
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+1-800-123-4567"
            className={
              errors.phone
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Address *
          </label>
          <Input
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Street address"
            className={
              errors.address
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            City *
          </label>
          <Input
            value={formData.city || ""}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="City"
            className={
              errors.city
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Country *
          </label>
          <Input
            value={formData.country || ""}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            placeholder="Country"
            className={
              errors.country
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.country && (
            <p className="text-red-500 text-xs mt-1">{errors.country}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Payment Terms *
          </label>
          <Input
            value={formData.paymentTerms || ""}
            onChange={(e) =>
              setFormData({ ...formData, paymentTerms: e.target.value })
            }
            placeholder="e.g., Net 30"
            className={
              errors.paymentTerms
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.paymentTerms && (
            <p className="text-red-500 text-xs mt-1">{errors.paymentTerms}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Website
          </label>
          <Input
            value={formData.website || ""}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            placeholder="https://example.com"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Products Supplied *
          </label>
          <Input
            value={productsSupplied}
            onChange={(e) => setProductsSupplied(e.target.value)}
            placeholder="e.g., Laptops, Desktops, Accessories"
            className={
              errors.productsSupplied
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.productsSupplied && (
            <p className="text-red-500 text-xs mt-1">
              {errors.productsSupplied}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Supply Contact Name *
          </label>
          <Input
            value={supplyContact}
            onChange={(e) => setSupplyContact(e.target.value)}
            placeholder="Contact person name"
            className={
              errors.supplyContact
                ? "border-red-500"
                : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
            }
          />
          {errors.supplyContact && (
            <p className="text-red-500 text-xs mt-1">{errors.supplyContact}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Upload Document
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="file"
              onChange={handleFileUpload}
              className="border-green-200 dark:border-teal-700 cursor-pointer dark:bg-slate-700 dark:text-slate-50"
            />
            {uploadedFile && (
              <span className="text-xs text-green-600 dark:text-teal-400 font-medium">
                {uploadedFile}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Upload contract, certificate, or other documents
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
        >
          {supplier ? "Update Supplier" : "Add Supplier"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
