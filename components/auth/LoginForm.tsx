"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AuthLayout, AuthCard, AuthButton, AuthInput } from "./AuthComponents";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithApiData, updateBusiness, updateBusinessSetup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/users/login", {
        username,
        password,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Extract user data from backend response
      const userData = {
        id: data.user._id || data.user.id,
        username: data.user.username,
        role: data.user.role,
        businessId: data.user.businessId, // Critical: get businessId from response
        business: data.user.business, // For backward compatibility
        token: data.token,
      };

      // Update auth context with API user data
      loginWithApiData(userData);

      // Update business setup in context if provided (for backward compatibility)
      if (data.user.business) {
        updateBusiness(data.user.business);
        updateBusinessSetup(data.user.business);
      }
      // Determine redirect based on whether user has business set up
      // If user has businessId or business data, they're ready for dashboard
      // If not, they need to complete onboarding
      if (userData.businessId || data.user.business) {
        router.push("/dashboard");
      } else {
        // User needs to complete business setup
        router.push("/onboarding");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout logoColor="green">
      <AuthCard title="Welcome Back" subtitle="Sign in to your account">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AuthInput
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            focusColor="green"
          />

          <AuthInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            focusColor="green"
          />

          <AuthButton
            isLoading={isLoading}
            loadingText="Signing in..."
            variant="green"
          >
            Sign In
          </AuthButton>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <a
              href="/auth/register"
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold hover:underline transition-colors duration-200"
            >
              Create one
            </a>
          </p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
          <strong className="font-semibold">💡 Tip:</strong> Use your registered
          username and password to log in.
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
