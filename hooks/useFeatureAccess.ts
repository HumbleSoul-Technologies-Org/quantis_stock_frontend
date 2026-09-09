"use client";

import { useAuth } from "@/context/AuthContext";
import { FeatureId } from "@/lib/types";

export function useFeatureAccess() {
  const { user, business } = useAuth();
  const entitlement = user?.entitlement || business?.entitlement;

  return {
    entitlement,
    isTrialActive: Boolean(entitlement?.trialActive),
    canAccess: (feature: FeatureId) =>
      Boolean(entitlement?.accessAllowed && entitlement.features[feature]),
    denialCode: entitlement?.accessAllowed ? "FEATURE_NOT_INCLUDED" : "TRIAL_EXPIRED",
  };
}