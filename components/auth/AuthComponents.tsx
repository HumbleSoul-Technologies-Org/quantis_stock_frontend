"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  logoColor?: "green" | "blue";
}

export function AuthLayout({ children, logoColor = "green" }: AuthLayoutProps) {
  const logoGradient =
    logoColor === "green"
      ? "from-green-500 to-green-600"
      : "from-blue-500 to-blue-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">{children}</div>
    </div>
  );
}

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="bg-white relative dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">
      <div className="text-center relative space-y-2">
        <span
          className={`w-full h-40 mx-auto  flex items-center justify-center`}
        >
          <img
            src="/logo_light.png"
            alt="Logo"
            className="w-full h-96 -mb-10 object-contain block dark:hidden"
          />
          <img
            src="/logo_dark.png"
            alt="Logo"
            className="w-full h-96 -mb-10 object-contain hidden dark:block"
          />
        </span>
        <h2 className="text-2xl mx-auto font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>

      {children}
    </div>
  );
}

interface AuthButtonProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: "green" | "blue";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}

export function AuthButton({
  children,
  isLoading = false,
  loadingText = "Loading...",
  variant = "green",
  disabled = false,
  onClick,
  type = "submit",
}: AuthButtonProps) {
  const gradient =
    variant === "green"
      ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
      : "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`w-full h-12 bg-linear-to-r ${gradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg flex items-center justify-center gap-2`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
}

interface AuthInputProps {
  label: string;
  type?: string;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  focusColor?: "green" | "blue";
  trailingIcon?: ReactNode;
  onIconClick?: () => void;
  // For React Hook Form compatibility
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value?: string;
  ref?: React.Ref<HTMLInputElement>;
  name?: string;
}

export function AuthInput({
  label,
  type = "text",
  placeholder,
  error,
  disabled = false,
  focusColor = "green",
  trailingIcon,
  onIconClick,
  onChange,
  onBlur,
  value,
  ref,
  name,
}: AuthInputProps) {
  const focusClasses =
    focusColor === "green"
      ? "focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400"
      : "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-12 px-4 border-2 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-xl transition-all duration-200 ${
            error
              ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:border-red-500 dark:focus:border-red-500"
              : `border-slate-300 dark:border-slate-600 ${focusClasses}`
          } ${trailingIcon ? "pr-12" : ""}`}
        />
        {trailingIcon && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {trailingIcon}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-600 dark:text-red-400 text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
