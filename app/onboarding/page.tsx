"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ClientOnly } from "@/components/client-only";
import { BusinessSetupForm } from "@/components/onboarding/BusinessSetupForm";
import { BusinessSetup } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

function OnboardingContent() {
  const router = useRouter();
  const { user, updateBusinessSetup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    userRedirecting();
  }, [user]); // Re-run when user changes to handle redirects

  const userRedirecting = () => {
    // Redirect if already has business setup
    if (user?.role === "admin" && user?.businessSetup) {
      router.push("/dashboard");
      return null;
    }

    if (!user) {
      router.push("/auth/login");
      return null;
    }
  };

  const handleSubmit = async (businessSetup: BusinessSetup) => {
    setIsLoading(true);
    setError("");

    try {
      await apiRequest("POST", `/users/${user?.id}/onboarding`, {
        businessSetup,
      });
      const success = updateBusinessSetup(businessSetup);
      if (success) {
        // SettingsContext will automatically sync the currency from businessSetup
        router.push("/dashboard");
      } else {
        setError("Failed to save business setup. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <BusinessSetupForm onSubmit={handleSubmit} isLoading={isLoading} />

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
