"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, X, ExternalLink } from "lucide-react";
import { storage } from "@/lib/storage";
import { apiRequest } from "@/lib/queryClient";

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

  const { loginWithApiData } = useAuth();
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
      // Check if user already exists
      const existingUsers = storage.getUsers();
      const userExists = existingUsers.some(
        (user) => user.username === username.trim(),
      );

      if (userExists) {
        setErrors({ username: "Username already exists" });
        setIsLoading(false);
        return;
      }

      // Create new admin user
      const payload = {
        username: username.trim(),
        password: password,
        role: "admin",
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
      };

      storage.createUser(newUser);
      setSuccess("Account created successfully! Redirecting...");

      // Auto-login after creation
      setTimeout(() => {
        router.push("/onboarding");
        loginWithApiData(newUser);
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

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-3xl">StockOS</CardTitle>
            <CardDescription className="text-blue-50">
              Admin Registration
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearFieldError("username");
                  }}
                  placeholder="Enter username"
                  disabled={isLoading}
                  className={`border-2 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.username
                      ? "border-red-400 bg-red-50 focus:border-red-500"
                      : "border-blue-200"
                  }`}
                />
                {errors.username && (
                  <p className="text-red-600 text-xs font-medium">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  placeholder="Enter password (min 6 characters)"
                  disabled={isLoading}
                  className={`border-2 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.password
                      ? "border-red-400 bg-red-50 focus:border-red-500"
                      : "border-blue-200"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-600 text-xs font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  placeholder="Confirm password"
                  disabled={isLoading}
                  className={`border-2 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.confirmPassword
                      ? "border-red-400 bg-red-50 focus:border-red-500"
                      : "border-blue-200"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Legal Error */}
              {errors.legal && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errors.legal}</span>
                </div>
              )}

              {/* Legal Agreement Checkbox */}
              <div className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition">
                <input
                  type="checkbox"
                  id="legal"
                  checked={acceptLegal}
                  onChange={(e) => {
                    setAcceptLegal(e.target.checked);
                    if (errors.legal) clearFieldError("legal");
                  }}
                  disabled={isLoading}
                  className="w-4 h-4 mt-1 accent-blue-600 cursor-pointer"
                />
                <label
                  htmlFor="legal"
                  className="flex-1 text-xs font-medium text-gray-700 cursor-pointer"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Login here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Document Modal */}
      {viewingLegal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl h-screen mt-5 mb-5 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-teal-100">
                {viewingLegal === "privacy"
                  ? "Privacy Policy"
                  : "Terms & Conditions"}
              </h2>
              <button
                onClick={() => setViewingLegal(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-slate-400" />
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
            <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingLegal(null)}
                className="dark:border-slate-600 dark:text-slate-300"
              >
                Back to Registration
              </Button>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
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
    </div>
  );
}
