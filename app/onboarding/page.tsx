"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { clearUserSession } from "@/lib/authStorage";
import { ClientOnly } from "@/components/client-only";
import { BusinessSetup, BusinessOnboardingPayload } from "@/lib/types";
import { BusinessSetupForm } from "@/components/onboarding/BusinessSetupForm";
import { apiRequest } from "@/lib/queryClient";

function OnboardingContent() {
  const router = useRouter();
  const { user, business, updateBusiness, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Allow admins to complete onboarding before requiring activation.
    if (user.role === "admin") {
      if (!business) {
        router.replace("/onboarding");
        return;
      }

      const hasRequiredOnboardingFields =
        !!business.businessName &&
        !!business.setupCompletedAt &&
        !!business.businessEmail?.email &&
        !!business.businessPhone?.contact &&
        !!business.settings?.currency?.code;

      if (business.activated) {
        router.replace("/dashboard");
        return;
      }

      if (hasRequiredOnboardingFields) {
        router.replace("/product-key");
        return;
      }
    }
  }, [user, business, authLoading, router]);

  const handleSubmit = async (businessSetup: BusinessSetup) => {
    setIsLoading(true);
    setError("");

    try {
      // For now, create a business object locally with proper settings
      // TODO: Uncomment and fix the API call when backend is ready
      const currencyMap: Record<
        string,
        { code: string; symbol: string; decimalPlaces: number }
      > = {
        USD: { code: "USD", symbol: "$", decimalPlaces: 2 },
        EUR: { code: "EUR", symbol: "€", decimalPlaces: 2 },
        GBP: { code: "GBP", symbol: "£", decimalPlaces: 2 },
        KES: { code: "KES", symbol: "KSh", decimalPlaces: 2 },
        UGX: { code: "UGX", symbol: "UGX", decimalPlaces: 0 },
        TZS: { code: "TZS", symbol: "TSh", decimalPlaces: 2 },
        ETB: { code: "ETB", symbol: "ETB", decimalPlaces: 2 },
        RWF: { code: "RWF", symbol: "FRw", decimalPlaces: 0 },
      };

      const currencyInfo =
        currencyMap[businessSetup.currency] || currencyMap["USD"];

      const businessWithSettings: BusinessOnboardingPayload = {
        ownerId: user?.id || "",
        businessName: businessSetup.businessName,
        businessType: businessSetup.businessType,
        businessEmail: businessSetup.businessEmail,
        businessPhone: businessSetup.businessPhone,
        businessAddress: businessSetup.businessAddress,
        setupCompletedAt: businessSetup.setupCompletedAt,
        settings: {
          currency: currencyInfo,
          notifications: {
            resourceChanges: businessSetup.notifications?.resourceChanges || {
              email: true,
              sms: false,
            },
            salesAlert: businessSetup.notifications?.salesAlert || {
              email: true,
              sms: false,
            },
            loginFailAttempts: businessSetup.notifications
              ?.loginFailAttempts || {
              email: true,
              sms: false,
            },
            systemUpdate: businessSetup.notifications?.systemUpdate || {
              email: true,
              sms: false,
            },
            returns: businessSetup.notifications?.returns || {
              email: true,
              sms: false,
            },
            lowStock: businessSetup.notifications?.lowStock || {
              email: true,
              sms: false,
            },
            userProfileChanges: businessSetup.notifications
              ?.userProfileChanges || {
              email: true,
              sms: false,
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        `/users/${user?.id}/onboarding`,
        businessWithSettings,
        user?.token,
      );

      const data = await response.json();

      if (response.ok && (data.business || data.businessData)) {
        // Update business in context with the correct response field
        const businessPayload = data.business || data.businessData;

        // Reset activation fields after demo onboarding completion
        // This prevents users from being redirected back to product key form
        if (business?.activationKey) {
          const demoKey =
            process.env.NEXT_PUBLIC_DEMO_PRODUCT_KEY || "466882-256-demo-key";
          if (business.activationKey === demoKey) {
            businessPayload.activated = false;
            businessPayload.activationKey = undefined;
          }
        }

        updateBusiness(businessPayload);
        // Show finalizing state while we navigate to product key activation
        setIsLoading(false);
        setIsFinalizing(true);
        router.replace("/product-key");
      } else {
        setError(
          data.message || "Failed to create business. Please try again.",
        );
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
      console.error("Onboarding error:", err);
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
      setError("Unable to restart registration. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-slate-900 dark:via-teal-900/20 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Inventory Manager
          </h1>
          <p className="text-gray-600 dark:text-slate-300 text-lg">
            Let's set up your business to get started
          </p>
        </div>

        <span onClick={restartRegistration} className="block text-center mb-6">
          <span className="text-teal-600 dark:text-teal-400 cursor-pointer hover:text-teal-700 dark:hover:text-teal-300 underline transition-colors">
            Restart the Registration Process if issues persist
          </span>
        </span>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form or Finalizing State */}
        {isFinalizing ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center shadow-xl max-w-2xl mx-auto">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-teal-600 dark:text-teal-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Finalizing Business Setup
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Please wait while we complete your business configuration...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <BusinessSetupForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 border border-teal-200 dark:border-teal-700 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Why we need this information:
          </h3>
          <ul className="text-sm text-teal-800 dark:text-teal-200 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
              Set currency for accurate pricing and reporting
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
              Configure stock warnings for your business needs
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
              Enable notifications to stay on top of inventory
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
              Customize settings based on your business type
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ClientOnly>
      <OnboardingContent />
    </ClientOnly>
  );
}
