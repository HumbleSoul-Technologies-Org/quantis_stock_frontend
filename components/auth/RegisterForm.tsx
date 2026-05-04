"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { clearUserSession } from "@/lib/authStorage";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, X, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { AuthLayout, AuthCard, AuthButton, AuthInput } from "./AuthComponents";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [viewingLegal, setViewingLegal] = useState<"privacy" | "terms" | null>(
    null,
  );

  // Field-level errors
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
    legal?: string;
    general?: string;
  }>({});

  const { loginWithApiData, user } = useAuth();
  const router = useRouter();

  // Clear errors when user starts typing
  const clearFieldError = (field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptLegal) {
      newErrors.legal =
        "You must accept the Privacy Policy and Terms & Conditions to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    // Validate form first
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create new admin user
      const payload = {
        username: username.trim(),
        password: password,
        role: "admin",
        tAndC: acceptLegal,
        privacyPolicy: acceptLegal,
      };

      const res = await apiRequest("POST", "/users/register", payload);

      if (!res.ok) {
        const text = await res.text();
        setErrors({
          general: `Failed to create account: ${text || "Please try again"}`,
        });
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const newUser = {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        createdAt: data.user.createdAt,
        token: data.token,
        businessId: data.user.businessId, // Include business data if returned by backend
        business: data.user.business, // Include business data if returned by backend
      };

      setSuccess("Account created successfully! Redirecting...");

      // Auto-login after creation
      loginWithApiData(newUser);
      setTimeout(() => {
        router.push("/onboarding");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const restartRegistration = async () => {
    try {
      await apiRequest(
        "POST",
        `/users/${user?.id}/restart-registration`,
        {},
        user?.token,
      );
      // Clear the current auth session and redirect to registration page
      clearUserSession();
      router.push("/auth/register");
    } catch (error) {
      console.error("Restart registration failed:", error);
      setErrors({
        general: "Unable to restart registration. Please try again later.",
      });
    }
  };

  return (
    <AuthLayout logoColor="blue">
      <AuthCard title="Create Account" subtitle="Set up your admin account">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <AuthInput
            label="Username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearFieldError("username");
            }}
            placeholder="Enter username"
            error={errors.username}
            disabled={isLoading}
            focusColor="blue"
          />

          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError("password");
            }}
            placeholder="Enter password (min 6 characters)"
            error={errors.password}
            disabled={isLoading}
            focusColor="blue"
          />

          <AuthInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearFieldError("confirmPassword");
            }}
            placeholder="Confirm password"
            error={errors.confirmPassword}
            disabled={isLoading}
            focusColor="blue"
          />

          {/* Legal Error */}
          {errors.legal && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errors.legal}</span>
            </div>
          )}

          {/* Legal Agreement Checkbox */}
          <div className="flex items-start gap-3 p-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 transition bg-slate-50 dark:bg-slate-700">
            <input
              type="checkbox"
              id="legal"
              checked={acceptLegal}
              onChange={(e) => {
                setAcceptLegal(e.target.checked);
                if (errors.legal) clearFieldError("legal");
              }}
              disabled={isLoading}
              className="w-4 h-4 mt-1 accent-blue-600 dark:accent-blue-500 cursor-pointer"
            />
            <label
              htmlFor="legal"
              className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              I accept the{" "}
              <button
                type="button"
                onClick={() => setViewingLegal("privacy")}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1"
              >
                Privacy Policy
                <ExternalLink className="w-3 h-3" />
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setViewingLegal("terms")}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1"
              >
                Terms & Conditions
                <ExternalLink className="w-3 h-3" />
              </button>
            </label>
          </div>

          <AuthButton
            isLoading={isLoading}
            loadingText="Creating Account..."
            variant="blue"
          >
            Create Admin Account
          </AuthButton>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline transition-colors duration-200"
            >
              Login here
            </a>
          </p>
        </div>

        <div
          onClick={restartRegistration}
          className="text-center cursor-pointer"
        >
          <span className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200">
            Click here to restart the registration process if issues persist
          </span>
        </div>
      </AuthCard>

      {/* Legal Document Modal */}
      {viewingLegal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl h-screen mt-5 mb-5 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {viewingLegal === "privacy"
                  ? "Privacy Policy"
                  : "Terms & Conditions"}
              </h2>
              <button
                onClick={() => setViewingLegal(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors duration-200"
              >
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Content - IFrame */}
            <iframe
              src={
                viewingLegal === "privacy"
                  ? "/legal/privacy-policy"
                  : "/legal/terms-conditions"
              }
              className="flex-1 w-full"
              title={
                viewingLegal === "privacy"
                  ? "Privacy Policy"
                  : "Terms & Conditions"
              }
            />

            {/* Modal Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingLegal(null)}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl"
              >
                Back to Registration
              </Button>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => {
                  setAcceptLegal(true);
                  setViewingLegal(null);
                }}
              >
                Accept & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
