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
  Bell,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageSquare,
  Wifi,
} from "lucide-react";

interface BusinessSetupFormProps {
  onSubmit: (businessSetup: BusinessSetup) => void;
  isLoading?: boolean;
}

export function BusinessSetupForm({
  onSubmit,
  isLoading = false,
}: BusinessSetupFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [currency, setCurrency] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
  const [notifications, setNotifications] = useState({
    resourceChanges: { email: false, sms: false },
    salesAlert: { email: false, sms: false },
    loginFailAttempts: { email: false, sms: false },
    systemUpdate: { email: false, sms: false },
    returns: { email: false, sms: false },
    lowStock: { email: false, sms: false },
    userProfileChanges: { email: false, sms: false },
  });
  const [syncInterval, setSyncInterval] = useState("15");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Profile",
      icon: Building2,
      description: "Business Information",
    },
    {
      id: 2,
      title: "Currency",
      icon: DollarSign,
      description: "Regional Settings",
    },
    {
      id: 3,
      title: "Notifications",
      icon: Bell,
      description: "Alert Preferences",
    },
    {
      id: 4,
      title: "Sync Settings",
      icon: RefreshCw,
      description: "Data Synchronization",
    },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!businessName?.trim()) {
        newErrors.businessName = "Business name is required";
      }
      if (!businessEmail?.trim()) {
        newErrors.businessEmail = "Business email is required";
      }
      if (!businessPhone?.trim()) {
        newErrors.businessPhone = "Business phone is required";
      }
      if (!businessAddress?.trim()) {
        newErrors.businessAddress = "Business address is required";
      }
    } else if (step === 2) {
      if (!currency?.trim()) {
        newErrors.currency = "Currency is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleNotification = (
    category: keyof typeof notifications,
    channel: "email" | "sms",
  ) => {
    setNotifications({
      ...notifications,
      [category]: {
        ...notifications[category],
        [channel]: !notifications[category][channel],
      },
    });
  };

  const handleCompleteSetup = () => {
    // This function completes the setup without saving settings
    // The settings should be saved separately using Save Settings button
    const businessSetup = {
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      businessType: "retail",
      currency,
      lowStockThreshold,
      notifications,
      setupCompletedAt: new Date().toISOString(),
    };
    onSubmit(businessSetup as any);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate all required fields
    if (!businessName?.trim()) {
      newErrors.businessName = "Business name is required";
    }
    if (!businessEmail?.trim()) {
      newErrors.businessEmail = "Business email is required";
    }
    if (!businessPhone?.trim()) {
      newErrors.businessPhone = "Business phone is required";
    }
    if (!businessAddress?.trim()) {
      newErrors.businessAddress = "Business address is required";
    }
    if (!currency?.trim()) {
      newErrors.currency = "Currency is required";
    }
    if (lowStockThreshold < 1 || lowStockThreshold > 100) {
      newErrors.lowStockThreshold = "Threshold must be between 1 and 100";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleCompleteSetup();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4 py-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isUpcoming = currentStep < step.id;

              return (
                <div
                  key={step.id}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                        isCompleted
                          ? "bg-teal-600 border-teal-600 text-white"
                          : isCurrent
                            ? "border-teal-600 text-teal-600 bg-teal-50 dark:bg-teal-900/20"
                            : "border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium text-center ${
                        isCurrent
                          ? "text-teal-600 dark:text-teal-400"
                          : "text-gray-500 dark:text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-3 mt-4 transition-all ${
                        isCompleted
                          ? "bg-teal-600"
                          : "bg-gray-300 dark:bg-slate-600"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-teal-100 mb-1">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>
        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <Card className="border-teal-200 dark:border-teal-700 shadow-md dark:shadow-lg">
              <CardHeader className="bg-linear-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800">
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
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
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
                      <p className="text-red-500 text-sm">
                        {errors.businessName}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                    Business Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="e.g., contact@mybusiness.com"
                    type="email"
                    className={`border-2 focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 ${
                      errors.businessEmail
                        ? "border-red-500 dark:border-red-500"
                        : "border-teal-200 dark:border-teal-700"
                    }`}
                  />
                  {errors.businessEmail && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">
                        {errors.businessEmail}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                    Business Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="e.g., +254 700 123 456"
                    type="tel"
                    className={`border-2 focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 ${
                      errors.businessPhone
                        ? "border-red-500 dark:border-red-500"
                        : "border-teal-200 dark:border-teal-700"
                    }`}
                  />
                  {errors.businessPhone && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">
                        {errors.businessPhone}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                    Business Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="e.g., 123 Market Street, Nairobi"
                    className={`border-2 focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 ${
                      errors.businessAddress
                        ? "border-red-500 dark:border-red-500"
                        : "border-teal-200 dark:border-teal-700"
                    }`}
                  />
                  {errors.businessAddress && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">
                        {errors.businessAddress}
                      </p>
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
                    Optimized for retail stores with inventory tracking and
                    sales management
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Currency */}
          {currentStep === 2 && (
            <Card className="border-teal-200 dark:border-teal-700 shadow-md dark:shadow-lg">
              <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
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
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
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
          )}

          {/* Step 3: Notifications */}
          {currentStep === 3 && (
            <Card className="border-teal-200 dark:border-teal-700 shadow-md dark:shadow-lg">
              <CardHeader className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800">
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
              <CardContent className="space-y-6">
                {/* Resource Changes Notifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                    Alert Resource Changes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Get notified if a resource is created, updated, and deleted
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.resourceChanges.email}
                        onChange={() =>
                          toggleNotification("resourceChanges", "email")
                        }
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          Email
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.resourceChanges.sms}
                        onChange={() =>
                          toggleNotification("resourceChanges", "sms")
                        }
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          SMS
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Sales Alert Notifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                    Sales Alert
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Get notified each time a sale is made
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.salesAlert.email}
                        onChange={() =>
                          toggleNotification("salesAlert", "email")
                        }
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          Email
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.salesAlert.sms}
                        onChange={() => toggleNotification("salesAlert", "sms")}
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          SMS
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Login Fail Attempts Notifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                    Login Fail Attempts
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Get notified when there is a login fail attempt
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.loginFailAttempts.email}
                        onChange={() =>
                          toggleNotification("loginFailAttempts", "email")
                        }
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          Email
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.loginFailAttempts.sms}
                        onChange={() =>
                          toggleNotification("loginFailAttempts", "sms")
                        }
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          SMS
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* System Update Notifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                    System Update
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Get notified each time a new system update is released
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.systemUpdate.email}
                        onChange={() =>
                          toggleNotification("systemUpdate", "email")
                        }
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          Email
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.systemUpdate.sms}
                        onChange={() =>
                          toggleNotification("systemUpdate", "sms")
                        }
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          SMS
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Returns Notifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                    Returns
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Get notified when there is a sale return
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.returns.email}
                        onChange={() => toggleNotification("returns", "email")}
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          Email
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.returns.sms}
                        onChange={() => toggleNotification("returns", "sms")}
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          SMS
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Low Stock Notifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                    Low Stock
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Get notified when a product hits its reorder level
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.lowStock.email}
                        onChange={() => toggleNotification("lowStock", "email")}
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          Email
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.lowStock.sms}
                        onChange={() => toggleNotification("lowStock", "sms")}
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          SMS
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* User Profile Changes Notifications */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                    User Profile Changes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Get notified when a new user profile is created, updated,
                    banned, and deleted
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.userProfileChanges.email}
                        onChange={() =>
                          toggleNotification("userProfileChanges", "email")
                        }
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          Email
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 dark:border-teal-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={notifications.userProfileChanges.sms}
                        onChange={() =>
                          toggleNotification("userProfileChanges", "sms")
                        }
                        className="w-4 h-4 text-green-600 border-green-200 rounded focus:ring-green-500"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          SMS
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Note:</p>
                  <p>
                    Notifications help you stay updated on critical business
                    events. SMS alerts require additional configuration in your
                    profile.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Sync Settings */}
          {currentStep === 4 && (
            <Card className="border-teal-200 dark:border-teal-700 shadow-md dark:shadow-lg">
              <CardHeader className="bg-linear-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <CardTitle className="text-gray-900 dark:text-teal-100">
                      Sync Settings{" "}
                      <b className="text-muted-foreground">(coming soon...)</b>
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-slate-400">
                      Configure data synchronization preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                    Data Synchronization
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Wifi className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        Online-Only Mode
                      </p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">
                        Application operates online for reliable data
                        synchronization
                      </p>
                    </div>
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                    Sync Interval (minutes)
                  </label>
                  <select
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-teal-200 dark:border-teal-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="5">Every 5 minutes</option>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every hour</option>
                  </select>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                    How often to sync data when online
                  </p>
                </div> */}

                {/* <div className="pt-4 border-t border-gray-200 dark:border-teal-700">
                  <Button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all"
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
                        Saving Settings...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Save Settings
                      </span>
                    )}
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <Button
              type="button"
              onClick={prevStep}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 border-2 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
          )}

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex-1 bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 text-base dark:from-teal-700 dark:to-emerald-700 dark:hover:from-teal-600 dark:hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all"
            >
              <span className="flex items-center gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </span>
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCompleteSetup}
              disabled={isLoading}
              className="flex-1 bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 text-base dark:from-teal-700 dark:to-emerald-700 dark:hover:from-teal-600 dark:hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all"
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
          )}
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
