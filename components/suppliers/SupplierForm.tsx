"use client";

import { useState } from "react";
import { Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { uploadFile } from "@/lib/cloudinary";
import { useAuth } from "@/context/AuthContext";

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
      address: { street: "", city: "", country: "" },
      city: "",
      country: "",
      contact: {
        primaryContact: "",
        primaryPhone: "",
        secondaryContact: "",
        secondaryPhone: "",
      },
      paymentTerms: "",
      payment: { bankDetails: "", taxId: "" },
      website: "",
      products: [],
      status: "active",
      rating: 0,
      notes: "",
    },
  );

  const [productsSupplied, setProductsSupplied] = useState(
    supplier?.name || "",
  );
  const [supplyContact, setSupplyContact] = useState(
    supplier?.contact?.primaryContact || "",
  );
  const [uploadedFile, setUploadedFile] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>(
    supplier?.documentUrl || "",
  );
  const [documentPublicId, setDocumentPublicId] = useState<string>(
    supplier?.documentPublicId || "",
  );
  const [isDocumentUploading, setIsDocumentUploading] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user } = useAuth();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file.name);
    setIsDocumentUploading(true);

    try {
      const uploadResult = await uploadFile(file);
      setDocumentUrl(uploadResult.secure_url);
      setDocumentPublicId(uploadResult.public_id);
      setFormData({
        ...formData,
        documentUrl: uploadResult.secure_url,
        documentPublicId: uploadResult.public_id,
      });
    } catch (error) {
      console.error("Document upload failed", error);
    } finally {
      setIsDocumentUploading(false);
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
    if (!formData.address || !formData.address.street?.trim())
      newErrors.address = "Street address is required";
    if (!formData.address?.city?.trim()) newErrors.city = "City is required";
    if (!formData.address?.country?.trim())
      newErrors.country = "Country is required";
    if (!productsSupplied.trim())
      newErrors.productsSupplied = "Products supplied is required";
    if (!supplyContact.trim())
      newErrors.supplyContact = "Supply contact name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const payLoad: Supplier = {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        address: formData.address || { street: "", city: "", country: "" },
        city: formData.address?.city || formData.city || "",
        country: formData.address?.country || formData.country || "",
        contact: {
          primaryContact: supplyContact,
          primaryPhone: formData.contact?.primaryPhone || "",
          secondaryContact: formData.contact?.secondaryContact || "",
          secondaryPhone: formData.contact?.secondaryPhone || "",
        },
        paymentTerms: formData.paymentTerms || "",
        payment: {
          bankDetails: formData.payment?.bankDetails || "",
          taxId: formData.payment?.taxId || "",
        },
        website: formData.website || "",
        products: productsSupplied
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        status: (formData.status as any) || "active",
        rating: formData.rating || 0,
        notes: formData.notes || "",
        contract: {
          url: documentUrl || formData?.contract?.url || "",
          publicId: documentPublicId || formData?.contract?.publicId || "",
        },
      };

      if (supplier && supplier.id) {
        // For updates, create the updated supplier object
        const updatedSupplier: Supplier = {
          ...supplier,
          ...payLoad,
          id: supplier.id,
          updatedAt: new Date().toISOString(),
        };
        onSubmit(updatedSupplier);
      } else {
        // For new suppliers, create the supplier object
        const newSupplier: Supplier = {
          ...payLoad,
          id: "", // Will be set by the backend
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        onSubmit(newSupplier);
      }
    } catch (error) {
      console.error("Failed to save supplier:", error);
      setErrors({ general: "Failed to save supplier. Please try again." });
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
            value={formData.address?.street || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value },
              })
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
            value={formData.address?.city || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, city: e.target.value },
              })
            }
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
            value={formData.address?.country || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: { ...formData.address, country: e.target.value },
              })
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
            placeholder="Comma-separated product SKUs or names"
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
            Primary Contact Name *
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
            Primary Contact Phone
          </label>
          <Input
            value={formData.contact?.primaryPhone || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact: { ...formData.contact, primaryPhone: e.target.value },
              })
            }
            placeholder="Contact phone number"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Secondary Contact
          </label>
          <Input
            value={formData.contact?.secondaryContact || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact: {
                  ...formData.contact,
                  secondaryContact: e.target.value,
                },
              })
            }
            placeholder="Secondary contact name"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Secondary Contact Phone
          </label>
          <Input
            value={formData.contact?.secondaryPhone || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact: {
                  ...formData.contact,
                  secondaryPhone: e.target.value,
                },
              })
            }
            placeholder="Secondary contact phone"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Bank Details
          </label>
          <Input
            value={formData.payment?.bankDetails || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                payment: { ...formData.payment, bankDetails: e.target.value },
              })
            }
            placeholder="Bank name, account"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Tax ID
          </label>
          <Input
            value={formData.payment?.taxId || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                payment: { ...formData.payment, taxId: e.target.value },
              })
            }
            placeholder="Tax / VAT ID"
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Status
          </label>
          <select
            value={formData.status || "active"}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-green-200 dark:border-teal-700 rounded-md text-sm dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Rating
          </label>
          <Input
            type="number"
            min={0}
            max={5}
            value={formData.rating || 0}
            onChange={(e) =>
              setFormData({ ...formData, rating: Number(e.target.value) })
            }
            className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:text-slate-100 border-green-200 dark:border-teal-700"
            placeholder="Internal notes about this supplier"
          />
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
