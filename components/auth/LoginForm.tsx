"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Section - Visual Content */}
      <div className="flex items-center justify-center p-4 lg:p-8 bg-gray-50 dark:bg-slate-800 lg:bg-white lg:dark:bg-slate-800">
        <div className="max-w-full text-center space-y-6">
          <div className="max-w-full  text-center space-y-6">
            {/* Logo/Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">StockOS</h1>
              <p className="text-green-100 text-lg">Stock Management System</p>
            </div>

            {/* Tagline */}
            <p className="text-green-200 text-sm italic">
              "Streamline your inventory, boost your business"
            </p>
          </div>
          <img src="/hero-3.png" />
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex items-center justify-center p-4 lg:p-8 bg-gray-50 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-800">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header - Only visible on small screens */}
          <div className="lg:hidden text-center space-y-2">
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
              StockOS
            </h1>
            <p className="text-gray-600 dark:text-slate-300">
              Stock Management System
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 sm:bg-transparent sm:dark:bg-transparent p-6 sm:p-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none sm:border  dark:border-slate-700">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Welcome Back
                </h2>
                <p className="text-gray-600 dark:text-slate-300 mt-1">
                  Sign in to your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white dark:text-white"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Don't have an account?{" "}
                  <a
                    href="/auth/register"
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
                  >
                    Register as Admin
                  </a>
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                <strong>💡 Tip:</strong> Use your registered username and
                password to log in.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
