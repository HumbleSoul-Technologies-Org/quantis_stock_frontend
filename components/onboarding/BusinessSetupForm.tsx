"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  businessSetupSchema,
  BusinessSetupFormData,
} from "@/lib/validations/businessSchemas";

interface BusinessSetupFormProps {
  onSubmit: (businessSetup: BusinessSetup) => void;
  isLoading?: boolean;
}

export function BusinessSetupForm({
  onSubmit,
  isLoading = false,
}: BusinessSetupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
    trigger,
  } = useForm<BusinessSetupFormData>({
    resolver: zodResolver(businessSetupSchema),
    defaultValues: {
      businessName: "",
      businessEmail: { email: "", activated: false },
      businessPhone: { contact: undefined, activated: false },
      businessAddress: "",
      businessType: "retail",
      currency: "",
      lowStockThreshold: 20,
      notifications: {
        resourceChanges: { email: false, sms: false },
        salesAlert: { email: false, sms: false },
        loginFailAttempts: { email: false, sms: false },
        systemUpdate: { email: false, sms: false },
        returns: { email: false, sms: false },
        lowStock: { email: false, sms: false },
        userProfileChanges: { email: false, sms: false },
      },
      setupCompletedAt: new Date().toISOString(),
    },
  });

  const watchedNotifications = watch("notifications");

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

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof BusinessSetupFormData)[] = [];

    if (step === 1) {
      fieldsToValidate = [
        "businessName",
        "businessEmail",
        "businessPhone",
        "businessAddress",
      ];
    } else if (step === 2) {
      fieldsToValidate = ["currency"];
    }

    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleNotification = (
    category: keyof BusinessSetupFormData["notifications"],
    channel: "email" | "sms",
  ) => {
    const currentValue = watchedNotifications?.[category]?.[channel] || false;
    setValue(
      `notifications.${category as string}.${channel}` as any,
      !currentValue,
    );
  };

  const onFormSubmit = (data: BusinessSetupFormData) => {
    const businessSetup: BusinessSetup = {
      businessName: data.businessName,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      businessAddress: data.businessAddress || "",
      businessType: data.businessType,
      currency: data.currency,
      lowStockThreshold: data.lowStockThreshold,
      notifications: data.notifications || {
        resourceChanges: { email: false, sms: false },
        salesAlert: { email: false, sms: false },
        loginFailAttempts: { email: false, sms: false },
        systemUpdate: { email: false, sms: false },
        returns: { email: false, sms: false },
        lowStock: { email: false, sms: false },
        userProfileChanges: { email: false, sms: false },
      },
      setupCompletedAt: data.setupCompletedAt,
    };
    onSubmit(businessSetup);
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={steps.length}
      title="Business Setup"
      subtitle="Complete your business information to get started with StockOS"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
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
                  {...register("businessName")}
                  placeholder="e.g., My Retail Store"
                  error={errors.businessName?.message}
                  required
                />

                <OnboardingInput
                  label="Business Email"
                  type="email"
                  {...register("businessEmail.email")}
                  placeholder="business@example.com"
                  error={errors.businessEmail?.email?.message}
                  required
                />

                <OnboardingInput
                  label="Business Phone"
                  type="number"
                  {...register("businessPhone.contact", {
                    valueAsNumber: true,
                  })}
                  placeholder="0712345678"
                  error={errors.businessPhone?.contact?.message}
                  required
                />

                <OnboardingInput
                  label="Business Address"
                  {...register("businessAddress")}
                  placeholder="123 Main Street, City, State, ZIP"
                  error={errors.businessAddress?.message}
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
                    {...register("currency")}
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
                      {errors.currency.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Low Stock Threshold
                  </label>
                  <Input
                    type="number"
                    {...register("lowStockThreshold", { valueAsNumber: true })}
                    placeholder="20"
                    className="border-2 focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified when stock falls below this number
                  </p>
                  {errors.lowStockThreshold && (
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.lowStockThreshold.message}
                    </p>
                  )}
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
                  {Object.entries(watchedNotifications || {}).map(
                    ([key, channels]) => (
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
                              checked={channels?.email || false}
                              onChange={() =>
                                toggleNotification(
                                  key as keyof BusinessSetupFormData["notifications"],
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
                              checked={channels?.sms || false}
                              onChange={() =>
                                toggleNotification(
                                  key as keyof BusinessSetupFormData["notifications"],
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
                    ),
                  )}
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
              type="submit"
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
      </form>
    </OnboardingLayout>
  );
}
