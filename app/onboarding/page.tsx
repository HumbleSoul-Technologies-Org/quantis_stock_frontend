"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { clearUserSession } from "@/lib/authStorage";
import { ClientOnly } from "@/components/client-only";
import { BusinessSetupForm } from "@/components/onboarding/BusinessSetupForm";
import { BusinessSetup, Business } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import Link from "next/link";

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

    // Redirect to dashboard if user is admin AND has completed business setup
    // Check both business object AND businessId field for robustness
    if (
      user?.role === "admin" &&
      business &&
      !!business.businessName &&
      business.settings !== null
    ) {
      router.replace("/dashboard");
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

      const businessWithSettings: any = {
        id: `temp-${Date.now()}`, // Temporary ID until backend is ready
        ownerId: user?.id || "",
        businessName: businessSetup.businessName,
        businessType: businessSetup.businessType,
        setupCompletedAt: businessSetup.setupCompletedAt,
        settings: {
          businessId: `temp-${Date.now()}`,
          currency: currencyInfo,
          units: {
            weightUnits: ["kg", "lbs", "oz", "g"],
            volumeUnits: ["L", "ml", "gallons", "fl oz"],
            lengthUnits: ["m", "cm", "mm", "inches", "feet", "km", "yards"],
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
          syncData: {
            offlineMode: false,
            syncInterval: "15",
          },
          notifications: {
            creationNotifications: businessSetup?.creationNotifications,
            SalesNotifications: businessSetup?.SalesNotifications,
            stockNotifications: businessSetup?.stockNotifications,
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
        updateBusiness(businessPayload);
        // Show finalizing state - redirect will be triggered by useEffect when business updates
        setIsLoading(false);
        setIsFinalizing(true);
      } else {
        setError(
          data.message || "Failed to create business. Please try again.",
        );
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
      console.log("====================================");
      console.log(err);
      console.log("====================================");
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
    <div className="min-h-screen bg-linear from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Inventory Manager
          </h1>
          <p className="text-gray-600">
            Let's set up your business to get started
          </p>
        </div>

        <span onClick={restartRegistration} className="block text-center mb-6">
          <span className="text-blue-600 cursor-pointer hover:text-blue-800 underline">
            Restart the Registration Process if issues persist
          </span>
        </span>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form or Finalizing State */}
        {isFinalizing ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-emerald-600"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Finalizing Business Setup
                </h3>
                <p className="text-gray-600">
                  Please wait while we complete your business configuration...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <BusinessSetupForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Why we need this information:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Set currency for accurate pricing and reporting</li>
            <li>✓ Configure stock warnings for your business needs</li>
            <li>✓ Enable notifications to stay on top of inventory</li>
            <li>✓ Customize settings based on your business type</li>
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
