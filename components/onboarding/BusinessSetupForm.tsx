"use client";

import { useState } from "react";
import { BusinessSetup } from "@/lib/types";
import { CURRENCIES, RETAIL_CONFIG } from "@/lib/business-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BusinessSetupFormProps {
  onSubmit: (businessSetup: BusinessSetup) => void;
  isLoading?: boolean;
}

export function BusinessSetupForm({
  onSubmit,
  isLoading = false,
}: BusinessSetupFormProps) {
  const [formData, setFormData] = useState({
    businessName: "",
    currency: "KES",
    lowStockThreshold: 20,
    emailAlerts: true,
    smsAlerts: false,
    lowStockAlerts: true,
    saleNotifications: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.businessName?.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (formData.lowStockThreshold < 1 || formData.lowStockThreshold > 100) {
      newErrors.lowStockThreshold = "Threshold must be between 1 and 100";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const businessSetup: BusinessSetup = {
        businessName: formData.businessName,
        businessType: "retail",
        currency: formData.currency,
        lowStockThreshold: formData.lowStockThreshold,
        emailAlerts: formData.emailAlerts,
        smsAlerts: formData.smsAlerts,
        lowStockAlerts: formData.lowStockAlerts,
        saleNotifications: formData.saleNotifications,
        setupCompletedAt: new Date().toISOString(),
      };
      onSubmit(businessSetup);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Business Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Business Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <Input
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
              placeholder="e.g., My Retail Store"
              className={
                errors.businessName ? "border-red-500" : "border-green-200"
              }
            />
            {errors.businessName && (
              <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-green-200 rounded-md text-sm text-gray-600">
              Retail
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Optimized for retail stores with inventory tracking and sales
              management
            </p>
          </div>
        </div>
      </div>

      {/* Currency & Regional Settings */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Currency & Regional
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency *
          </label>
          <select
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            className="w-full px-3 py-2 border border-green-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name} ({curr.symbol})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Includes East African currencies (KES, UGX, TZS, ETB, RWF) and major
            international currencies (USD, EUR, GBP)
          </p>
        </div>
      </div>

      {/* Inventory Management */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Inventory Management
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Low Stock Warning Threshold (%) *
          </label>
          <Input
            type="number"
            min="1"
            max="100"
            value={formData.lowStockThreshold}
            onChange={(e) =>
              setFormData({
                ...formData,
                lowStockThreshold: parseInt(e.target.value) || 20,
              })
            }
            className={
              errors.lowStockThreshold ? "border-red-500" : "border-green-200"
            }
          />
          {errors.lowStockThreshold && (
            <p className="text-red-500 text-xs mt-1">
              {errors.lowStockThreshold}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Alert when stock drops to this percentage of reorder level. Default:
            20%
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-green-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Notifications
        </h2>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.lowStockAlerts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lowStockAlerts: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-gray-300 text-green-600"
            />
            <span className="text-sm text-gray-700">Low Stock Alerts</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.saleNotifications}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  saleNotifications: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-gray-300 text-green-600"
            />
            <span className="text-sm text-gray-700">Sale Notifications</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.emailAlerts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emailAlerts: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-gray-300 text-green-600"
            />
            <span className="text-sm text-gray-700">Email Alerts</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.smsAlerts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  smsAlerts: e.target.checked,
                })
              }
              className="w-4 h-4 rounded border-gray-300 text-green-600"
            />
            <span className="text-sm text-gray-700">
              SMS Alerts (coming soon)
            </span>
          </label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading ? "Setting up..." : "Complete Setup"}
      </Button>
    </form>
  );
}
