"use client";

import { ReactNode } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
}: OnboardingLayoutProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-slate-900 dark:via-teal-900/20 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              {subtitle}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  steps: Array<{
    id: number;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
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
                  className={`w-12 h-12 rounded-full border-3 flex items-center justify-center mb-3 transition-all duration-300 ${
                    isCompleted
                      ? "bg-linear-to-r from-teal-500 to-emerald-600 border-teal-500 text-white shadow-lg"
                      : isCurrent
                        ? "border-teal-500 text-teal-600 bg-teal-50 dark:bg-teal-900/20 shadow-md"
                        : "border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`text-sm font-semibold text-center leading-tight ${
                    isCurrent
                      ? "text-teal-600 dark:text-teal-400"
                      : isCompleted
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
                <span
                  className={`text-xs text-center mt-1 max-w-20 ${
                    isCurrent
                      ? "text-teal-500 dark:text-teal-500"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.description}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 mt-4 transition-all duration-500 ${
                    isCompleted
                      ? "bg-gradient-to-r from-teal-500 to-emerald-600"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface OnboardingCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function OnboardingCard({
  children,
  title,
  subtitle,
  icon: Icon,
}: OnboardingCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

interface OnboardingButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: "left" | "right";
}

export function OnboardingButton({
  children,
  variant = "primary",
  disabled = false,
  onClick,
  type = "button",
  icon: Icon,
  iconPosition = "left",
}: OnboardingButtonProps) {
  const baseClasses =
    "h-12 px-6 font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100",
    outline:
      "border-2 border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {Icon && iconPosition === "left" && <Icon className="w-5 h-5" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="w-5 h-5" />}
    </button>
  );
}

interface OnboardingInputProps {
  label: string;
  type?: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  // For React Hook Form compatibility
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value?: string;
  ref?: React.Ref<HTMLInputElement>;
  name?: string;
}

export function OnboardingInput({
  label,
  type = "text",
  placeholder,
  error,
  disabled = false,
  required = false,
  onChange,
  onBlur,
  value,
  ref,
  name,
}: OnboardingInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full h-12 px-4 border-2 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 ${
          error
            ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:border-red-500 dark:focus:border-red-500"
            : "border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400"
        }`}
      />
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
}
