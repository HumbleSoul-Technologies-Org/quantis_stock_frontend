"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BusinessSetup } from "@/lib/types";
import { CURRENCIES } from "@/lib/business-config";
import { Input } from "@/components/ui/input";
import {
  Building2,
  DollarSign,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
    trigger,
  } = useForm<BusinessSetupFormData>({
    resolver: zodResolver(businessSetupSchema),
    defaultValues: {
      businessName: "",
      businessEmail: { email: "", activated: false },
      businessPhone: { contact: "", activated: false },
      businessAddress: "",
      businessType: "retail",
      currency: "",
      lowStockThreshold: 20,
      setupCompletedAt: new Date().toISOString(),
    },
  });

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

  const onFormSubmit = (data: BusinessSetupFormData) => {
    const businessSetup: BusinessSetup = {
      businessName: data.businessName,
      businessEmail: data.businessEmail,
      businessPhone: {
        contact: Number(data.businessPhone.contact),
        activated: data.businessPhone.activated,
      },
      businessAddress: data.businessAddress || "",
      businessType: data.businessType,
      currency: data.currency,
      lowStockThreshold: data.lowStockThreshold,
      setupCompletedAt: data.setupCompletedAt,
    };
    onSubmit(businessSetup);
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={steps.length}
      title="Business Setup"
      subtitle="Complete your business information to get started with Quantis stock"
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
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  {...register("businessPhone.contact")}
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
