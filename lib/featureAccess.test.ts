import {
  canAccessFeature,
  isTrialCurrentlyActive,
} from "@/lib/featureAccess";
import type { BusinessEntitlement, FeatureId } from "@/lib/types";

const features: FeatureId[] = [
  "sales",
  "product_profiles",
  "supplier_profiles",
  "credit_sales",
  "customer_management",
  "credit_trace",
  "multi_branch",
];

const entitlement = (
  overrides: Partial<BusinessEntitlement> = {},
): BusinessEntitlement => ({
  plan: "retail",
  trialActive: false,
  subscriptionActive: false,
  accessAllowed: false,
  trial: { expiresAt: null },
  features: {},
  ...overrides,
});

describe("feature access", () => {
  const now = new Date("2026-01-01T00:00:00.000Z").getTime();

  it("grants every non-manufacturer feature during an active trial", () => {
    const activeTrial = entitlement({
      trialActive: true,
      accessAllowed: true,
      trial: { expiresAt: "2026-01-02T00:00:00.000Z" },
    });

    expect(isTrialCurrentlyActive(activeTrial, now)).toBe(true);
    for (const feature of features) {
      expect(canAccessFeature(activeTrial, feature, now)).toBe(true);
    }
  });

  it("does not grant trial access after expiration without a subscription", () => {
    const expiredTrial = entitlement({
      trialActive: true,
      accessAllowed: true,
      trial: { expiresAt: "2025-12-31T00:00:00.000Z" },
      features: Object.fromEntries(features.map((feature) => [feature, true])),
    });

    expect(isTrialCurrentlyActive(expiredTrial, now)).toBe(false);
    for (const feature of features) {
      expect(canAccessFeature(expiredTrial, feature, now)).toBe(false);
    }
  });

  it("applies the active retail plan after trial expiration, even with stale trial features", () => {
    const expiredRetailTrial = entitlement({
      plan: "retail",
      trialActive: true,
      subscriptionActive: true,
      accessAllowed: true,
      trial: { expiresAt: "2025-12-31T00:00:00.000Z" },
      features: Object.fromEntries(features.map((feature) => [feature, true])),
    });

    expect(canAccessFeature(expiredRetailTrial, "sales", now)).toBe(true);
    expect(
      canAccessFeature(expiredRetailTrial, "customer_management", now),
    ).toBe(false);
    expect(canAccessFeature(expiredRetailTrial, "credit_sales", now)).toBe(
      false,
    );
  });

  it("keeps all features for wholesale after trial expiration", () => {
    const expiredWholesaleTrial = entitlement({
      plan: "wholesale",
      trialActive: true,
      subscriptionActive: true,
      accessAllowed: true,
      trial: { expiresAt: "2025-12-31T00:00:00.000Z" },
    });

    for (const feature of features) {
      expect(canAccessFeature(expiredWholesaleTrial, feature, now)).toBe(true);
    }
  });
});
