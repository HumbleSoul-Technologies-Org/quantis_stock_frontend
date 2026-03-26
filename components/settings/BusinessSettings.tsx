"use client";

import { BusinessSetup } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENCIES } from "@/lib/business-config";
import { Building2 } from "lucide-react";

interface BusinessSettingsProps {
  businessSetup: BusinessSetup | undefined;
  onUpdate: (businessSetup: BusinessSetup) => void;
}

export function BusinessSettings({
  businessSetup,
  onUpdate,
}: BusinessSettingsProps) {
  const [formData, setFormData] = useState<BusinessSetup>(
    businessSetup || {
      businessName: "",
      businessType: "retail",
      currency: "KES",
      lowStockThreshold: 20,
      emailAlerts: true,
      smsAlerts: false,
      lowStockAlerts: true,
      saleNotifications: true,
      setupCompletedAt: new Date().toISOString(),
    },
  );
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName?.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (formData.lowStockThreshold < 1 || formData.lowStockThreshold > 100) {
      newErrors.lowStockThreshold = "Threshold must be between 1 and 100";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onUpdate(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Information */}
      <Card className="border-green-200 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
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
              {formData.businessType === "retail"
                ? "Retail - Optimized for retail stores"
                : "Other"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Contact support to change business type
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
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
          </div>
        </CardContent>
      </Card>

      {/* Inventory Settings */}
      <Card className="border-green-200 border-2">
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Low Stock Warning Threshold (%)
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
              Alert when stock drops to this percentage of reorder level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-green-200 border-2">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.lowStockAlerts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lowStockAlerts: e.target.checked,
                })
              }
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Low Stock Alerts</p>
              <p className="text-sm text-gray-600">
                Get notified when products fall below threshold
              </p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.saleNotifications}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  saleNotifications: e.target.checked,
                })
              }
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Sale Notifications</p>
              <p className="text-sm text-gray-600">
                Get notified when sales are completed
              </p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.emailAlerts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emailAlerts: e.target.checked,
                })
              }
              className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Email Alerts</p>
              <p className="text-sm text-gray-600">
                Receive email notifications for alerts
              </p>
            </div>
          </label>

          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={formData.smsAlerts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  smsAlerts: e.target.checked,
                })
              }
              disabled
              className="w-4 h-4 text-gray-300 border-gray-200 rounded cursor-not-allowed"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">SMS Alerts</p>
              <p className="text-sm text-gray-600">Coming soon</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm">
            ✓ Business settings saved successfully
          </p>
        </div>
      )}

      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
        Save All Changes
      </Button>
    </div>
  );
}
