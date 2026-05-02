"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearUserSession } from "@/lib/authStorage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Key, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function ProductKeyForm() {
  const [productKey, setProductKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<{
    productKey?: string;
    general?: string;
  }>({});

  const { loginWithApiData, user, business } = useAuth();
  const router = useRouter();

  const clearFieldError = (field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!productKey.trim()) {
      newErrors.productKey = "Product key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Check for demo key first (configurable via environment variable)
      const demoKey =
        process.env.NEXT_PUBLIC_DEMO_PRODUCT_KEY || "466882-256-demo-key";
      if (productKey.trim() === demoKey) {
        // For demo activation, only set the activation key fields
        // Keep all user credentials and other business data intact
        if (business) {
          const updatedBusiness = business
            ? {
                ...business,
                activated: true,
                activationKey: demoKey,
              }
            : {
                id: `temp-${Date.now()}`,
                ownerId: user?.id,
                businessName: "Demo Business",
                businessType: "retail" as const,
                setupCompletedAt: new Date().toISOString(),
                activated: true,
                activationKey: demoKey,
                settings: {
                  businessId: `temp-${Date.now()}`,
                  currency: { code: "USD", symbol: "$", decimalPlaces: 2 },
                  units: {
                    weightUnits: ["kg", "lbs", "oz", "g"],
                    volumeUnits: ["L", "ml", "gallons", "fl oz"],
                    lengthUnits: [
                      "m",
                      "cm",
                      "mm",
                      "inches",
                      "feet",
                      "km",
                      "yards",
                    ],
                    countUnits: [
                      "units",
                      "pieces",
                      "boxes",
                      "cases",
                      "packs",
                      "cartons",
                      "bottles",
                      "tablets",
                      "capsules",
                    ],
                  },
                  syncData: { offlineMode: false, syncInterval: "15" },
                  notifications: {
                    resourceChanges: { email: false, sms: false },
                    salesAlert: { email: false, sms: false },
                    loginFailAttempts: { email: false, sms: false },
                    systemUpdate: { email: false, sms: false },
                    returns: { email: false, sms: false },
                    lowStock: { email: false, sms: false },
                    userProfileChanges: { email: false, sms: false },
                  },
                  security: { autoLogoutTimeout: 0 },
                },
              };

          const updatedUser = {
            ...user,
            business: updatedBusiness,
          };

          setSuccess("Demo Mode Activated! Redirecting...");

          // // Update auth context with only activation fields changed
          loginWithApiData(updatedUser as any);
          router.push("/dashboard");
        }

        setIsLoading(false);
        return;
      } else {
        const payload = {
          productKey: productKey.trim(),
        };

        const res = await apiRequest(
          "POST",
          `/users/${user?.id}/verify-key`,
          payload,
          user?.token,
        );

        if (!res.ok) {
          const text = await res.text();
          setErrors({
            general: `Invalid product key: ${text || "Please check your key and try again"}`,
          });
          setIsLoading(false);
          return;
        }

        const userData = await res.json();
        // userData structure: { id, username, email, role, businessId, business: { activated, activationKey, ... } }
        const newUser = {
          id: userData.user.id,
          username: userData.user.username,
          role: userData.user.role,
          createdAt: userData.user.createdAt,
          token: user?.token || "", // Preserve existing token if available
          businessId: userData.user.businessId, // Include business data if returned by backend
          business: userData.user.business, // Include business data if returned by backend
        };

        setSuccess("Product key validated successfully! Redirecting...");

        // Update auth context with the validated data
        loginWithApiData(newUser);
        if (user || (business && business.activated)) {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";
      setErrors({ general: errorMessage });
      console.log("====================================");
      console.log(error);
      console.log("====================================");
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
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800 rounded-full mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-teal-100 mb-2">
            Activate Your Account
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-400">
            Enter your product key to unlock full access to StockOS
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-emerald-200 dark:border-teal-700 bg-white dark:bg-slate-900 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-teal-900 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-teal-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-teal-100">
                  Product Key Validation
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-slate-400">
                  Secure your business data with activation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="productKey"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
                >
                  Product Key
                </label>
                <Input
                  id="productKey"
                  type="text"
                  value={productKey}
                  onChange={(e) => {
                    setProductKey(e.target.value);
                    clearFieldError("productKey");
                  }}
                  placeholder="Enter your 16-character product key"
                  className="border-2 border-emerald-200 dark:border-teal-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-teal-500 focus:border-emerald-500 dark:focus:border-teal-500 transition-colors"
                />
                {errors.productKey && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.productKey}
                  </p>
                )}
              </div>

              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="text-red-700 dark:text-red-400 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                    {errors.general}
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <div className="text-emerald-700 dark:text-emerald-400 text-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
                    {success}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-800 dark:to-teal-800 dark:hover:from-emerald-900 dark:hover:to-teal-900 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Validating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Key className="w-5 h-5 mr-2" />
                    Validate Product Key
                  </div>
                )}
              </Button>

              <p className="text-sm text-gray-500 dark:text-slate-500">
                Ran into a problem? OR don't have a product key?{" "}
                <button
                  type="button"
                  onClick={restartRegistration}
                  className="text-emerald-600 cursor-pointer dark:text-emerald-400 hover:underline"
                >
                  Restart registration
                </button>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-slate-500">
            Need help? Contact our support team for assistance with your product
            key.
          </p>
        </div>
      </div>
    </div>
  );
}
