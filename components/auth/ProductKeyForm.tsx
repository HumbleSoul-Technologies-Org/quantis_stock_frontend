"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { clearUserSession } from "@/lib/authStorage";
import { AlertCircle, CheckCircle, Key, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AuthCard, AuthInput, AuthButton } from "./AuthComponents";
import {
  productKeySchema,
  ProductKeyFormData,
} from "@/lib/validations/authSchemas";

export function ProductKeyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [restartLoading, setRestartLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const { loginWithApiData, user, business } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ProductKeyFormData>({
    resolver: zodResolver(productKeySchema),
  });

  const onSubmit = async (data: ProductKeyFormData) => {
    setSuccess("");
    setIsLoading(true);

    try {
      // Check for demo key first (configurable via environment variable)
      const demoKey =
        process.env.NEXT_PUBLIC_DEMO_PRODUCT_KEY || "466882-256-demo-key";
      if (data.productKey.trim() === demoKey) {
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
          toast({
            title: "Demo Mode Activated",
            description:
              "Welcome to demo mode! You now have full access to Quantis stock.",
          });

          // // Update auth context with only activation fields changed
          loginWithApiData(updatedUser as any);
          router.push("/dashboard");
        }

        setIsLoading(false);
        return;
      } else {
        const payload = {
          productKey: data.productKey.trim(),
        };

        const res = await apiRequest(
          "POST",
          `/users/${user?.id}/verify-key`,
          payload,
          user?.token,
        );

        if (!res.ok) {
          const text = await res.text();
          const errorMsg = text || "Please check your key and try again";
          setError("root", {
            message: `Invalid product key: ${errorMsg}`,
          });
          toast({
            variant: "destructive",
            title: "Invalid Product Key",
            description: errorMsg,
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
      setError("root", { message: errorMessage });
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      console.error("Product key validation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const restartRegistration = async () => {
    setRestartLoading(true);
    try {
      await apiRequest(
        "POST",
        `/users/${user?.id}/restart-registration`,
        {},
        user?.token,
      );
      // Clear the current auth session and redirect to registration page
      clearUserSession();
      toast({
        title: "Registration Reset",
        description:
          "Your registration has been reset. Redirecting to registration page...",
      });
      router.push("/auth/register");
    } catch (error) {
      const errorMessage =
        "Unable to restart registration. Please try again later.";
      setError("root", {
        message: errorMessage,
      });
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: errorMessage,
      });
      console.error("Restart registration failed:", error);
    } finally {
      setRestartLoading(false);
    }
  };
  return (
    <div className="relative">
      <AuthCard
        title="Activate Your Account"
        subtitle="Enter your product key to unlock full access to Quantis stock"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AuthInput
            label="Product Key"
            type="text"
            {...register("productKey")}
            placeholder="Enter your 16-character product key"
            error={errors.productKey?.message}
          />

          {errors.root && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="text-red-700 dark:text-red-400 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {errors.root.message}
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

          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText="Validating..."
            disabled={isLoading}
          >
            <Key className="w-5 h-5 mr-2" />
            Validate Product Key
          </AuthButton>

          <p className="text-sm text-gray-500 dark:text-slate-500 text-center">
            Ran into a problem? OR don't have a product key?{" "}
            <button
              type="button"
              onClick={restartRegistration}
              disabled={restartLoading}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Restart registration
            </button>
          </p>
        </form>
      </AuthCard>

      {/* Restart Registration Loading Overlay */}
      {restartLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Restarting registration...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
