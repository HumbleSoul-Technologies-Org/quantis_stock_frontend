import type { Business, User } from "./types";

export function getAuthLandingPath(
  user: User | null,
  business?: Business | null,
): string {
  if (!user) return "/auth/login";

  const activeBusiness =
    business ?? (user.business as Business | undefined) ?? null;
  if (!activeBusiness) {
    return user.role === "admin" ? "/onboarding" : "/dashboard";
  }

  if (activeBusiness.activated) return "/dashboard";

  const entitlement = user.entitlement ?? activeBusiness.entitlement;
  const trialExpiry =
    activeBusiness.trial_expires ||
    user.trial_expires ||
    entitlement?.trial.expiresAt;

  if (trialExpiry) {
    return new Date(trialExpiry).getTime() > Date.now()
      ? "/dashboard"
      : "/subscriptions";
  }

  if (entitlement?.trialActive || entitlement?.subscriptionActive) {
    return "/dashboard";
  }

  if (
    entitlement?.accessState === "trial_expired" ||
    activeBusiness.trialClaimedAt
  ) {
    return "/subscriptions";
  }

  const setupComplete = Boolean(
    activeBusiness.businessName &&
      activeBusiness.businessType &&
      activeBusiness.setupCompletedAt &&
      activeBusiness.businessEmail?.email &&
      activeBusiness.businessPhone?.contact &&
      activeBusiness.settings?.currency?.code,
  );
  if (!setupComplete) {
    return user.role === "admin" ? "/onboarding" : "/subscriptions";
  }
  if (user.role !== "admin") return "/subscriptions";

  return "/product-key";
}

export function canStartTrial(
  user: User | null,
  business?: Business | null,
): boolean {
  if (
    !user ||
    user.role !== "admin" ||
    (user.trial_days !== undefined && user.trial_days <= 0)
  ) {
    return false;
  }

  return getAuthLandingPath(user, business) === "/product-key";
}