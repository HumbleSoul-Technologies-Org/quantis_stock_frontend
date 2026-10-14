import { canStartTrial, getAuthLandingPath } from "./accessRouting";
import type { Business, User } from "./types";

const baseUser = {
  id: "user-1",
  username: "owner",
  role: "admin" as const,
  trial_days: 30,
};

const completedBusiness = {
  id: "business-1",
  ownerId: "user-1",
  businessName: "Test Business",
  businessType: "retail" as const,
  setupCompletedAt: "2026-10-14T00:00:00.000Z",
  businessEmail: { email: "owner@example.com", verified: true },
  businessPhone: { contact: "12345", verified: true },
  settings: {
    currency: { code: "USD", symbol: "$", decimalPlaces: 2 },
  } as Business["settings"],
  activated: false,
};

describe("getAuthLandingPath", () => {
  it("sends unauthenticated users to login and incomplete accounts to onboarding", () => {
    expect(getAuthLandingPath(null)).toBe("/auth/login");
    expect(getAuthLandingPath(baseUser as User, null)).toBe("/onboarding");
    expect(
      getAuthLandingPath(baseUser as User, {
        ...completedBusiness,
        setupCompletedAt: "",
      } as Business),
    ).toBe("/onboarding");
  });

  it("offers an unclaimed trial after completed onboarding", () => {
    expect(
      getAuthLandingPath(baseUser as User, completedBusiness as Business),
    ).toBe("/product-key");
    expect(canStartTrial(baseUser as User, completedBusiness as Business)).toBe(
      true,
    );
  });

  it("does not offer the business trial to staff users", () => {
    const staffUser = { ...baseUser, role: "manager" } as User;
    expect(
      getAuthLandingPath(staffUser, completedBusiness as Business),
    ).toBe("/subscriptions");
    expect(canStartTrial(staffUser, completedBusiness as Business)).toBe(false);
  });

  it("sends active trials to the dashboard and expired trials to subscriptions", () => {
    const activeExpiry = new Date(Date.now() + 86400000).toISOString();
    const expiredExpiry = new Date(Date.now() - 86400000).toISOString();
    expect(
      getAuthLandingPath(
        {
          ...baseUser,
          trial_expires: activeExpiry,
        } as User,
        completedBusiness as Business,
      ),
    ).toBe("/dashboard");
    expect(
      getAuthLandingPath(
        {
          ...baseUser,
          trial_expires: expiredExpiry,
        } as User,
        completedBusiness as Business,
      ),
    ).toBe("/subscriptions");
  });

  it("sends activated businesses to the dashboard and never offers a second trial", () => {
    const activatedBusiness = {
      ...completedBusiness,
      activated: true,
    } as Business;
    expect(getAuthLandingPath(baseUser as User, activatedBusiness)).toBe(
      "/dashboard",
    );
    expect(canStartTrial(baseUser as User, activatedBusiness)).toBe(false);
  });
});