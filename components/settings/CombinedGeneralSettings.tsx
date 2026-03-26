"use client";

import { AppSettings, BusinessSetup } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENCIES } from "@/lib/business-config";
import { Building2, Settings } from "lucide-react";

interface CombinedGeneralSettingsProps {
  businessSetup: BusinessSetup | undefined;
  settings: AppSettings;
  onUpdateBusiness: (businessSetup: BusinessSetup) => void;
  onUpdateGeneral: (settings: Partial<AppSettings>) => void;
}

export function CombinedGeneralSettings({
  businessSetup,
  settings,
  onUpdateBusiness,
  onUpdateGeneral,
}: CombinedGeneralSettingsProps) {
  const [businessData, setBusinessData] = useState<BusinessSetup>(
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

  const [generalData, setGeneralData] = useState(settings.general);
  const [currencyData, setCurrencyData] = useState(settings.currency);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get the selected currency object
  const selectedCurrency = CURRENCIES.find(
    (c) => c.code === businessData.currency,
  );

  const handleCurrencyChange = (newCurrencyCode: string) => {
    const currency = CURRENCIES.find((c) => c.code === newCurrencyCode);
    if (currency) {
      setBusinessData({ ...businessData, currency: newCurrencyCode });
      setCurrencyData({
        code: currency.code,
        symbol: currency.symbol,
        decimalPlaces: 2, // Default to 2 decimal places
      });
    }
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!businessData.businessName?.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (
      businessData.lowStockThreshold < 1 ||
      businessData.lowStockThreshold > 100
    ) {
      newErrors.lowStockThreshold = "Threshold must be between 1 and 100";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onUpdateBusiness(businessData);
      onUpdateGeneral({ general: generalData, currency: currencyData });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  errors.businessName ? "border-red-500" : "border-green-200"
                }
              />
              {errors.businessName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.businessName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Type
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-green-200 rounded-md text-sm text-gray-600">
                {businessData.businessType === "retail"
                  ? "Retail - Optimized for retail stores"
                  : "Other"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contact support to change
              </p>
            </div>
          </div>

          {/* Currency Section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              Currency Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <select
                  value={businessData.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency Symbol
                </label>
                <Input
                  value={currencyData.symbol}
                  onChange={(e) =>
                    setCurrencyData({ ...currencyData, symbol: e.target.value })
                  }
                  placeholder="$"
                  className="border-green-200"
                  maxLength={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decimal Places
                </label>
                <select
                  value={currencyData.decimalPlaces}
                  onChange={(e) =>
                    setCurrencyData({
                      ...currencyData,
                      decimalPlaces: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-green-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={0}>0 (12)</option>
                  <option value={1}>1 (12.5)</option>
                  <option value={2}>2 (12.50)</option>
                  <option value={3}>3 (12.500)</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
              <p className="text-xs text-blue-700">
                <strong>Preview:</strong> {currencyData.symbol}
                {(100).toFixed(currencyData.decimalPlaces)}
              </p>
            </div>
          </div>

          {/* Other Settings Section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Other Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    : "border-green-200"
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm">
            ✓ Settings saved successfully
          </p>
        </div>
      )}

      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
        Save All Changes
      </Button>
    </div>
  );
}
