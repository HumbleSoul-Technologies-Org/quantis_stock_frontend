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
import { AlertCircle } from "lucide-react";
import {
  Store,
  Globe,
  CheckCircle2,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BusinessSetupFormProps {
  onSubmit: (businessSetup: BusinessSetup) => void;
  isLoading?: boolean;
}

interface StepProgressProps {
  steps: Array<{
    id: number;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  currentStep: number;
}

function StepProgress({ steps, currentStep }: StepProgressProps) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center max-w-24">
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-teal-600 border-teal-600 text-white shadow-lg"
                    : isCurrent
                      ? "border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-900/20 shadow-md"
                      : "border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <div className="text-center">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OnboardingHero() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full mb-6 shadow-lg">
        <Store className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        Welcome to StockOS
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        Let's set up your business profile to get you started with powerful
        inventory management
      </p>
    </div>
  );
}

export function BusinessSetupForm({
  onSubmit,
  isLoading = false,
}: BusinessSetupFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState({
    email: "",
    verified: false,
  });
  const [businessPhone, setBusinessPhone] = useState({
    contact: "",
    verified: false,
  });
  const [businessAddress, setBusinessAddress] = useState("");
  const [currency, setCurrency] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(20);
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
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!businessName?.trim()) {
        newErrors.businessName = "Business name is required";
      }
      if (!businessEmail.email?.trim()) {
        newErrors.businessEmail = "Business email is required";
      }
      if (!businessPhone.contact?.trim()) {
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
    if (!businessEmail.email?.trim()) {
      newErrors.businessEmail = "Business email is required";
    }
    if (!businessPhone.contact?.trim()) {
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
        <OnboardingHero />

        {/* Progress Indicator */}
        <StepProgress steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <Card className="border-teal-200 dark:border-teal-700 shadow-lg dark:shadow-xl bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                    <Store className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 dark:text-teal-100 text-lg">
                      Business Information
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-slate-400">
                      Tell us about your business to personalize your experience
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
                    className={`border-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 ${
                      errors.businessName
                        ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-slate-600"
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
                    value={businessEmail.email}
                    onChange={(e) =>
                      setBusinessEmail({
                        ...businessEmail,
                        email: e.target.value,
                      })
                    }
                    placeholder="e.g., contact@mybusiness.com"
                    type="email"
                    className={`border-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 ${
                      errors.businessEmail
                        ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-slate-600"
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
                    value={businessPhone.contact}
                    onChange={(e) =>
                      setBusinessPhone({
                        ...businessPhone,
                        contact: e.target.value,
                      })
                    }
                    placeholder="e.g., +254 700 123 456"
                    type="tel"
                    className={`border-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 ${
                      errors.businessPhone
                        ? "border-red-500 dark:border-red-500 focus:ring-red-500"
                        : "border-gray-300 dark:border-slate-600"
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
            <Card className="border-teal-200 dark:border-teal-700 shadow-lg dark:shadow-xl bg-white dark:bg-slate-900 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                    <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 dark:text-teal-100 text-lg">
                      Currency & Location
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-slate-400">
                      Set your regional preferences for accurate reporting
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
