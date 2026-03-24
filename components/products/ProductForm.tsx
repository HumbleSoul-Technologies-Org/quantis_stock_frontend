'use client';

import { useState } from 'react';
import { Product, Supplier } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductFormProps {
  product?: Product;
  suppliers: Supplier[];
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

export function ProductForm({ product, suppliers, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      name: '',
      sku: '',
      category: '',
      unitPrice: 0,
      costPrice: 0,
      unit: 'units',
      supplierId: '',
      reorderLevel: 10,
      currentStock: 0,
    }
  );

  const [model, setModel] = useState(product?.['model'] || '');
  const [brand, setBrand] = useState(product?.['brand'] || '');
  const [size, setSize] = useState(product?.['size'] || '');
  const [color, setColor] = useState(product?.['color'] || '');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const units = ['units', 'kg', 'lbs', 'oz', 'L', 'ml', 'gallons', 'boxes'];
  const categories = ['Electronics', 'Accessories', 'Cables', 'Software', 'Hardware', 'Other'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if ((formData.unitPrice || 0) <= 0) newErrors.unitPrice = 'Unit price must be greater than 0';
    if ((formData.costPrice || 0) < 0) newErrors.costPrice = 'Cost price must be 0 or greater';
    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
    if ((formData.reorderLevel || 0) < 0) newErrors.reorderLevel = 'Reorder level must be 0 or greater';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newProduct: Product = {
      id: product?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name || '',
      sku: formData.sku || '',
      category: formData.category || '',
      unitPrice: formData.unitPrice || 0,
      costPrice: formData.costPrice || 0,
      unit: formData.unit || 'units',
      supplierId: formData.supplierId || '',
      reorderLevel: formData.reorderLevel || 10,
      currentStock: 0,
      createdAt: product?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Laptop Computer"
                className={errors.name ? 'border-red-500' : 'border-green-200'}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <Input
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., LAP-001"
                className={errors.sku ? 'border-red-500' : 'border-green-200'}
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  errors.category ? 'border-red-500' : 'border-green-200'
                }`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select
                value={formData.supplierId || ''}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  errors.supplierId ? 'border-red-500' : 'border-green-200'
                }`}
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplierId && <p className="text-red-500 text-xs mt-1">{errors.supplierId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.unitPrice || ''}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                placeholder="0.00"
                className={errors.unitPrice ? 'border-red-500' : 'border-green-200'}
              />
              {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costPrice || ''}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                placeholder="0.00"
                className={errors.costPrice ? 'border-red-500' : 'border-green-200'}
              />
              {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={formData.unit || 'units'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
              <Input
                type="number"
                value={formData.reorderLevel || ''}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                placeholder="0"
                className={errors.reorderLevel ? 'border-red-500' : 'border-green-200'}
              />
              {errors.reorderLevel && <p className="text-red-500 text-xs mt-1">{errors.reorderLevel}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Dell, Apple, Lenovo"
                className="border-green-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., ThinkPad X1, MacBook Pro"
                className="border-green-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <Input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g., 15 inch, Large"
                className="border-green-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Silver, Space Gray"
                className="border-green-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border-green-200 cursor-pointer"
              />
              {uploadedImage && <p className="text-xs text-green-600 mt-1">Uploaded: {uploadedImage}</p>}
            </div>

            {imagePreview && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-32 h-32 object-cover border border-green-200 rounded"
                />
              </div>
            )}
          </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {product ? 'Update Product' : 'Add Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
