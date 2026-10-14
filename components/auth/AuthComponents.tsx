"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  logoColor?: "green" | "blue";
  leftPanel?: ReactNode;
}

export function AuthLayout({
  children,
  logoColor = "green",
  leftPanel,
}: AuthLayoutProps) {
  const accentClass =
    logoColor === "green"
      ? "from-emerald-500 via-green-600 to-emerald-700"
      : "from-blue-500 via-sky-600 to-cyan-700";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_45%,_#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(135deg,_#020817_0%,_#0f172a_35%,_#020817_100%)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/70 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
        <div className="grid lg:grid-cols-[1.05fr_1.1fr]">
          <div
            className={`relative hidden overflow-hidden bg-gradient-to-br ${accentClass} p-8 lg:flex`}
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(15,23,42,0.45)), url("https://media.istockphoto.com/id/1488294044/photo/businessman-works-on-laptop-showing-business-analytics-dashboard-with-charts-metrics-and-kpi.jpg?s=612x612&w=0&k=20&c=AcxzQAe1LY4lGp0C6EQ6reI7ZkFC2ftS09yw_3BVkpk=")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_35%)]" />
            <div className="absolute inset-y-0 right-0 w-[34%] bg-gradient-to-l from-white/90 via-white/55 to-transparent dark:from-slate-900/90 dark:via-slate-900/65 dark:to-transparent" />
            <div className="relative z-10 flex h-full w-full flex-col justify-between">
              {leftPanel ?? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    Hey
                    <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/70">
                      Business Suite
                    </p>
                    <h1 className="max-w-md text-3xl font-semibold leading-tight text-white">
                      Run your stock, sales, and operations in one secure workspace.
                    </h1>
                  </div>

                  <p className="max-w-md text-sm leading-6 text-slate-100/80">
                    Manage inventory, suppliers, and reporting with a clear view
                    of your entire operation from one place.
                  </p>

                  <div className="space-y-3 text-sm text-white/90">
                    {[
                      "Real-time stock visibility",
                      "Branch-ready operations",
                      "Secure admin access",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                          ✓
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}

export function AuthCard({
  children,
  title,
  subtitle,
  className = "",
}: AuthCardProps) {
  return (
    <div
      className={`bg-transparent relative p-6 sm:p-8 lg:p-10 ${className}`}
    >
      <div className="w-full -top-10 absolute flex  gap-4 justify-center align-center">
       <img
                  src="/logo_dark.png"
                  alt="Logo"
                  className="h-75 w-full object-contain"
                />
      </div>

      <div className="space-y-2 mt-35">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="mt-8">{children}</div>
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
  defaultValue?: string;
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
  defaultValue,
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
          defaultValue={defaultValue}
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
