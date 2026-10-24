"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { FeatureId } from "@/lib/types";
import {
  canAccessFeature,
  isTrialCurrentlyActive,
} from "@/lib/featureAccess";

export function useFeatureAccess() {
  const { user, business } = useAuth();
  const entitlement = user?.entitlement || business?.entitlement;
  const trialExpiresAt = entitlement?.trial.expiresAt;
  const [, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!entitlement?.trialActive || !trialExpiresAt) return;

    const remainingTime = new Date(trialExpiresAt).getTime() - Date.now();
    if (remainingTime <= 0) {
      setCurrentTime(Date.now());
      return;
    }

    const timeoutId = window.setTimeout(
      () => setCurrentTime(Date.now()),
      remainingTime,
    );
    return () => window.clearTimeout(timeoutId);
  }, [entitlement?.trialActive, trialExpiresAt]);

  const isTrialActive = isTrialCurrentlyActive(entitlement);
  const accessAllowed = Boolean(
    isTrialActive || entitlement?.subscriptionActive,
  );

  return {
    entitlement,
    isTrialActive,
    canAccess: (feature: FeatureId) =>
      canAccessFeature(entitlement, feature),
    denialCode: accessAllowed ? "FEATURE_NOT_INCLUDED" : "TRIAL_EXPIRED",
  };
}
