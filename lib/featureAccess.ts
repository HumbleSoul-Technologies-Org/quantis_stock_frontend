import type {
  BusinessEntitlement,
  FeatureId,
  SubscriptionPlan,
} from "@/lib/types";

const PLAN_FEATURES: Record<SubscriptionPlan, readonly FeatureId[]> = {
  retail: [
    "sales",
    "product_profiles",
    "supplier_profiles",
    "multi_branch",
  ],
  wholesale: [
    "sales",
    "product_profiles",
    "supplier_profiles",
    "credit_sales",
    "customer_management",
    "credit_trace",
    "multi_branch",
  ],
  manufacturer: [
    "sales",
    "product_profiles",
    "supplier_profiles",
    "credit_sales",
    "customer_management",
    "credit_trace",
    "multi_branch",
  ],
};

function normalizePlan(plan: string | null | undefined): SubscriptionPlan | null {
  if (plan === "wholesaler") return "wholesale";
  if (
    plan === "retail" ||
    plan === "wholesale" ||
    plan === "manufacturer"
  ) {
    return plan;
  }
  return null;
}

export function isTrialCurrentlyActive(
  entitlement: BusinessEntitlement | null | undefined,
  now = Date.now(),
): boolean {
  if (!entitlement?.trialActive || !entitlement.trial.expiresAt) return false;

  const expiresAt = new Date(entitlement.trial.expiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt > now;
}

export function canAccessFeature(
  entitlement: BusinessEntitlement | null | undefined,
  feature: FeatureId,
  now = Date.now(),
): boolean {
  if (!entitlement) return false;
  if (isTrialCurrentlyActive(entitlement, now)) return true;
  if (!entitlement.subscriptionActive) return false;

  const trialExpiry = entitlement.trial.expiresAt
    ? new Date(entitlement.trial.expiresAt).getTime()
    : Number.NaN;
  if (Number.isFinite(trialExpiry) && trialExpiry <= now) {
    const plan = normalizePlan(entitlement.plan);
    return plan ? PLAN_FEATURES[plan].includes(feature) : false;
  }

  return Boolean(entitlement.features[feature]);
}
