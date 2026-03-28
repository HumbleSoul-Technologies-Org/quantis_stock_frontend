"use client";

import { AppSettings, BusinessSetup } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENCIES } from "@/lib/business-config";
import { Building2, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";

interface CombinedGeneralSettingsProps {
  businessSetup: BusinessSetup | undefined;
  settings: AppSettings;
  onUpdateBusiness: (businessSetup: BusinessSetup) => void;
}

export function CombinedGeneralSettings({
  businessSetup,
  settings,
  onUpdateBusiness,
}: CombinedGeneralSettingsProps) {
  const [businessData, setBusinessData] = useState<BusinessSetup>(
    businessSetup || {
      businessName: "",
      businessType: "retail",
      currency: "",
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
  const { user } = useAuth();

  // Get the selected currency object
  const selectedCurrency = CURRENCIES.find(
    (c) => c.code === businessData.currency,
  );

  const handleCurrencyChange = (newCurrencyCode: string) => {
    setBusinessData({ ...businessData, currency: newCurrencyCode });
  };

  const handleSave = async () => {
    try {
      const newErrors: Record<string, string> = {};

      if (!businessData.businessName?.trim()) {
        newErrors.businessName = "Business name is required";
      }
      if (!businessData.currency?.trim()) {
        newErrors.currency = "Currency is required";
      }
      if (
        businessData.lowStockThreshold < 1 ||
        businessData.lowStockThreshold > 100
      ) {
        newErrors.lowStockThreshold = "Threshold must be between 1 and 100";
      }

      setErrors(newErrors);

      const payLoad = {
        businessName: businessData.businessName,
        businessType: businessData.businessType,
        currency: businessData.currency,
        lowStockThreshold: businessData.lowStockThreshold,
      };

      await apiRequest(
        "PUT",
        `/users/${user?.id}/business-setup`,
        payLoad,
        user?.token,
      );
      if (Object.keys(newErrors).length === 0) {
        onUpdateBusiness(businessData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-teal-100">
            <Building2 className="w-5 h-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Business Name *
              </label>
              <Input
                value={businessData.businessName}
                onChange={(e) =>
                  setBusinessData({
                    ...businessData,
                    businessName: e.target.value,
                  })
                }
                placeholder="e.g., My Retail Store"
                className={
                  errors.businessName
                    ? "border-red-500"
                    : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
                }
              />
              {errors.businessName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.businessName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Business Type
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-green-200 rounded-md text-sm text-gray-600 dark:bg-slate-700 dark:border-teal-700 dark:text-slate-400">
                {businessData.businessType === "retail"
                  ? "Retail - Optimized for retail stores"
                  : "Other"}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                Contact support to change
              </p>
            </div>
          </div>

          {/* Currency Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-teal-700">
            <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-4">
              Currency Settings
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Currency *
              </label>
              <select
                value={businessData.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 dark:text-slate-50 ${
                  errors.currency
                    ? "border-red-500"
                    : "border-green-200 dark:border-teal-700"
                }`}
              >
                <option value="">-- Select a currency --</option>
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="text-red-500 text-xs mt-1">{errors.currency}</p>
              )}
            </div>

            {selectedCurrency && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4 dark:bg-blue-900/20 dark:border-blue-700">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Selected:</strong> {selectedCurrency.code} -{" "}
                  {selectedCurrency.name} ({selectedCurrency.symbol})
                </p>
              </div>
            )}
          </div>

          {/* Other Settings Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-teal-700">
            <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-4">
              Other Settings
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Low Stock Warning Threshold (%) *
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={businessData.lowStockThreshold}
                onChange={(e) =>
                  setBusinessData({
                    ...businessData,
                    lowStockThreshold: parseInt(e.target.value) || 20,
                  })
                }
                className={
                  errors.lowStockThreshold
                    ? "border-red-500"
                    : "border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
                }
              />
              {errors.lowStockThreshold && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lowStockThreshold}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-700">
          <p className="text-green-700 dark:text-green-300 text-sm">
            ✓ Settings saved successfully
          </p>
        </div>
      )}

      <Button
        onClick={handleSave}
        className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
      >
        Save All Changes
      </Button>
    </div>
  );
}
