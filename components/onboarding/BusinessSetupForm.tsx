"use client";

import { useState } from "react";
import { BusinessSetup } from "@/lib/types";
import { CURRENCIES, RETAIL_CONFIG } from "@/lib/business-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Store,
  Globe,
  Package,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
    currency: "",
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
    if (!formData.currency?.trim()) {
      newErrors.currency = "Currency is required";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4 py-8">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-teal-100 mb-2">
            Business Setup
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-400">
            Complete your business information to get started with StockOS
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex justify-between items-center">
          {[
            { step: 1, label: "Business Info", icon: Store },
            { step: 2, label: "Currency", icon: Globe },
            { step: 3, label: "Inventory", icon: Package },
            { step: 4, label: "Notifications", icon: Bell },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 border-2 border-teal-600 dark:border-teal-400 flex items-center justify-center mb-2">
                  <item.icon className="w-5 h-5 text-teal-600 dark:text-teal-300" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-slate-300 text-center">
                  {item.label}
                </span>
              </div>
              {idx < 3 && (
                <div className="flex-1 h-1 bg-gray-300 dark:bg-slate-600 mx-3 mt-4" />
              )}
            </div>
          ))}
        </div>

        {/* Business Information */}
        <Card className="mb-6 border-teal-200 dark:border-teal-700 shadow-md dark:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <div>
                <CardTitle className="text-gray-900 dark:text-teal-100">
                  Business Information
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400">
                  Tell us about your business
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                placeholder="e.g., My Retail Store"
                className={`border-2 focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 ${
                  errors.businessName
                    ? "border-red-500 dark:border-red-500"
                    : "border-teal-200 dark:border-teal-700"
                }`}
              />
              {errors.businessName && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-500 text-sm">{errors.businessName}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                Business Type
              </label>
              <div className="px-4 py-3 bg-teal-50 dark:bg-slate-800 border-2 border-teal-200 dark:border-teal-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Retail
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                Optimized for retail stores with inventory tracking and sales
                management
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Currency & Regional Settings */}
        <Card className="mb-6 border-teal-200 dark:border-teal-700 shadow-md dark:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <CardTitle className="text-gray-900 dark:text-teal-100">
                  Currency & Location
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400">
                  Regional settings for your business
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className={`w-full px-4 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-slate-100 ${
                errors.currency
                  ? "border-red-500 dark:border-red-500"
                  : "border-teal-200 dark:border-teal-700"
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
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-500 text-sm">{errors.currency}</p>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-3">
              ✓ East African currencies (KES, UGX, TZS, ETB, RWF)
              <br />✓ International currencies (USD, EUR, GBP, and more)
            </p>
          </CardContent>
        </Card>

        {/* Inventory Management */}
        <Card className="mb-6 border-teal-200 dark:border-teal-700 shadow-md dark:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-sky-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              <div>
                <CardTitle className="text-gray-900 dark:text-teal-100">
                  Inventory Management
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400">
                  Stock monitoring settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Low Stock Warning Threshold (%){" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
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
                className={`flex-1 border-2 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.lowStockThreshold
                    ? "border-red-500 dark:border-red-500"
                    : "border-teal-200 dark:border-teal-700"
                }`}
              />
              <span className="text-lg font-semibold text-gray-700 dark:text-slate-200">
                %
              </span>
            </div>
            {errors.lowStockThreshold && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-red-500 text-sm">
                  {errors.lowStockThreshold}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-3">
              Receive alerts when stock drops below this percentage of reorder
              level. Default: 20%
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-8 border-teal-200 dark:border-teal-700 shadow-md dark:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <div>
                <CardTitle className="text-gray-900 dark:text-teal-100">
                  Notifications
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400">
                  Choose how you want to be notified
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "lowStockAlerts",
                  label: "Low Stock Alerts",
                  description: "Get notified when stock runs low",
                  enabled: true,
                },
                {
                  key: "saleNotifications",
                  label: "Sale Notifications",
                  description: "Receive sale confirmations",
                  enabled: true,
                },
                {
                  key: "emailAlerts",
                  label: "Email Alerts",
                  description: "Alerts via email",
                  enabled: true,
                },
                {
                  key: "smsAlerts",
                  label: "SMS Alerts",
                  description: "Coming soon",
                  enabled: false,
                },
              ].map((notification) => (
                <label
                  key={notification.key}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData[notification.key as keyof typeof formData]
                      ? "border-teal-500 bg-teal-50 dark:bg-slate-800 dark:border-teal-600"
                      : "border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700"
                  } ${
                    !notification.enabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={
                      (formData[
                        notification.key as keyof typeof formData
                      ] as boolean) || false
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [notification.key]: e.target.checked,
                      })
                    }
                    disabled={!notification.enabled}
                    className="w-5 h-5 rounded border-gray-300 text-teal-600 dark:border-slate-600 dark:bg-slate-700 accent-teal-600 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {notification.label}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      {notification.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 text-base dark:from-teal-700 dark:to-emerald-700 dark:hover:from-teal-600 dark:hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Setting up your business...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Complete Setup
              </span>
            )}
          </Button>
        </div>

        {/* Footer Help */}
        <div className="mt-8 text-center text-xs text-gray-600 dark:text-slate-400">
          <p>
            You can update these settings anytime from your business settings
          </p>
        </div>
      </form>
    </div>
  );
}
