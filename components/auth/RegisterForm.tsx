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
import { AlertCircle, CheckCircle } from "lucide-react";
import { storage } from "@/lib/storage";
import { apiRequest } from "@/lib/queryClient";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Field-level errors
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
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
    </div>
  );
}
