import { BusinessEntitlement, User } from "./types";

type ApiUser = Partial<User> & {
  _id?: string;
  id?: string;
  isDemoActivation?: boolean;
  entitlement?: BusinessEntitlement;
};

const FEATURE_IDS = [
  "sales",
  "product_profiles",
  "supplier_profiles",
  "credit_sales",
  "customer_management",
  "credit_trace",
  "multi_branch",
] as const;

function deriveEntitlement(source: ApiUser): BusinessEntitlement | undefined {
  const business = source.business as any;
  if (!business) return undefined;

  const plan = business.currentPlan || business.businessType;
  const trialExpires = business.trial_expires || source.trial_expires;
  const trialStarts = business.trial_start || source.trial_start;
  const trialActive = Boolean(
    trialExpires && new Date(trialExpires) > new Date(),
  );
  const subscriptionActive = Boolean(business.activated && plan);
  const paidFeatures = new Set(
    plan === "wholesale" || plan === "wholesaler"
      ? FEATURE_IDS
      : ["sales", "product_profiles", "supplier_profiles", "multi_branch"],
  );

  return {
    businessId: source.businessId || business._id || business.id,
    plan: plan === "wholesaler" ? "wholesale" : plan,
    trialActive,
    subscriptionActive,
    accessAllowed: trialActive || subscriptionActive,
    trial: {
      startsAt: trialStarts || null,
      expiresAt: trialExpires || null,
    },
    features: Object.fromEntries(
      FEATURE_IDS.map((feature) => [feature, trialActive || paidFeatures.has(feature)]),
    ),
  };
}

export function normalizeAuthUser(
  apiUser: ApiUser,
  token?: string,
  previousUser?: User | null,
): User {
  const source = { ...(previousUser || {}), ...apiUser };
  const id = source.id || source._id;

  if (!id || !source.username || !source.role) {
    throw new Error("Incomplete authenticated user data");
  }

  const businessData = source.business as
    | { _id?: string; id?: string }
    | undefined;

  return {
    ...source,
    id,
    username: source.username,
    role: source.role,
    token: token || source.token || previousUser?.token,
    businessId:
      source.businessId || businessData?._id || businessData?.id,
    entitlement: source.entitlement || deriveEntitlement(source),
  } as User;
}
