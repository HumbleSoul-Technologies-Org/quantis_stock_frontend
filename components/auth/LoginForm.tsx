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
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-linear-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="text-3xl">StockOS</CardTitle>
            <CardDescription className="text-green-50">
              Stock Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/auth/register"
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Register as Admin
                </a>
              </p>
            </div>

            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <strong>💡 Tip:</strong> Use your registered username and password
              to log in.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
