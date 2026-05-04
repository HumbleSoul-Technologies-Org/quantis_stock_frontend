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
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageSquare,
} from "lucide-react";
import {
  OnboardingLayout,
  StepIndicator,
  OnboardingCard,
  OnboardingButton,
  OnboardingInput,
} from "./OnboardingComponents";

interface BusinessSetupFormProps {
  onSubmit: (businessSetup: BusinessSetup) => void;
  isLoading?: boolean;
}

export function BusinessSetupForm({
  onSubmit,
  isLoading = false,
}: BusinessSetupFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState({
    email: "",
    activated: false,
  });
  const [businessPhone, setBusinessPhone] = useState({
    contact: 0,
    activated: false,
  });
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
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!businessName?.trim()) {
        newErrors.businessName = "Business name is required";
      }
      if (!businessEmail?.email?.trim()) {
        newErrors.businessEmail = "Business email is required";
      }
      if (!businessPhone?.contact) {
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
    if (!businessEmail?.email?.trim()) {
      newErrors.businessEmail = "Business email is required";
    }
    if (!businessPhone?.contact) {
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
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={steps.length}
      title="Business Setup"
      subtitle="Complete your business information to get started with StockOS"
    >
      <div className="space-y-8">
        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <OnboardingCard
              title="Business Information"
              subtitle="Tell us about your business"
              icon={Building2}
            >
              <div className="space-y-6">
                <OnboardingInput
                  label="Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., My Retail Store"
                  error={errors.businessName}
                  required
                />

                <OnboardingInput
                  label="Business Email"
                  type="email"
                  value={businessEmail.email}
                  onChange={(e) =>
                    setBusinessEmail({
                      ...businessEmail,
                      email: e.target.value,
                    })
                  }
                  placeholder="business@example.com"
                  error={errors.businessEmail}
                  required
                />

                <OnboardingInput
                  label="Business Phone"
                  type="text"
                  value={
                    businessPhone.contact ? String(businessPhone.contact) : ""
                  }
                  onChange={(e) =>
                    setBusinessPhone({
                      ...businessPhone,
                      contact: Number(e.target.value),
                    })
                  }
                  placeholder="07xx-xxx-xxx"
                  error={errors.businessPhone}
                  required
                />

                <OnboardingInput
                  label="Business Address"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="123 Main Street, City, State, ZIP"
                  error={errors.businessAddress}
                  required
                />
              </div>
            </OnboardingCard>
          )}

          {/* Step 2: Currency */}
          {currentStep === 2 && (
            <OnboardingCard
              title="Regional Settings"
              subtitle="Configure your currency and location preferences"
              icon={DollarSign}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-12 px-4 border-2 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400"
                  >
                    <option value="">Select your currency</option>
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                  {errors.currency && (
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.currency}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Low Stock Threshold
                  </label>
                  <Input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) =>
                      setLowStockThreshold(Number(e.target.value))
                    }
                    placeholder="20"
                    className="border-2 focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified when stock falls below this number
                  </p>
                </div>
              </div>
            </OnboardingCard>
          )}

          {/* Step 3: Notifications */}
          {currentStep === 3 && (
            <OnboardingCard
              title="Notification Preferences"
              subtitle="Choose how you want to stay updated"
              icon={Bell}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(notifications).map(([key, channels]) => (
                    <div
                      key={key}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4"
                    >
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 capitalize">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={channels.email}
                            onChange={() =>
                              toggleNotification(
                                key as keyof typeof notifications,
                                "email",
                              )
                            }
                            className="w-4 h-4 text-teal-600 bg-slate-100 border-slate-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                          />
                          <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            Email
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={channels.sms}
                            onChange={() =>
                              toggleNotification(
                                key as keyof typeof notifications,
                                "sms",
                              )
                            }
                            className="w-4 h-4 text-teal-600 bg-slate-100 border-slate-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                          />
                          <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            SMS
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </OnboardingCard>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6">
          <OnboardingButton
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            icon={ChevronLeft}
            iconPosition="left"
          >
            Previous
          </OnboardingButton>

          <div className="flex items-center gap-2">
            {Array.from({ length: steps.length }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i + 1 === currentStep
                    ? "bg-teal-600 w-6"
                    : i + 1 < currentStep
                      ? "bg-teal-400"
                      : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length ? (
            <OnboardingButton
              variant="primary"
              onClick={handleCompleteSetup}
              disabled={isLoading}
              icon={CheckCircle2}
              iconPosition="right"
            >
              {isLoading ? "Setting up..." : "Complete Setup"}
            </OnboardingButton>
          ) : (
            <OnboardingButton
              variant="primary"
              onClick={nextStep}
              icon={ChevronRight}
              iconPosition="right"
            >
              Next
            </OnboardingButton>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
}
