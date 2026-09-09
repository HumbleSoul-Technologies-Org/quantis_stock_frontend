import { normalizeAuthUser } from "./authUser";

describe("normalizeAuthUser", () => {
  it("preserves trial and license fields returned by the API", () => {
    const user = normalizeAuthUser(
      {
        id: "user-1",
        username: "owner",
        email: "owner@example.com",
        role: "admin",
        businessId: "business-1",
        business: {
          id: "business-1",
          ownerId: "user-1",
          businessName: "Retail Business",
          businessType: "retail",
          setupCompletedAt: "2030-01-01T00:00:00.000Z",
          settings: {} as never,
          currentPlan: "retail",
          activated: false,
        },
        trial_expires: "2030-01-31T00:00:00.000Z",
        trial_days: 30,
        product_key_verified: false,
      },
      "token-1",
    );

    expect(user).toMatchObject({
      id: "user-1",
      token: "token-1",
      trial_expires: "2030-01-31T00:00:00.000Z",
      trial_days: 30,
      product_key_verified: false,
    });
    expect(user.entitlement?.features.credit_sales).toBe(true);
    expect(user.entitlement?.features.multi_branch).toBe(true);
  });

  it("preserves the existing token when activation omits it", () => {
    const user = normalizeAuthUser(
      {
        id: "user-1",
        username: "owner",
        role: "admin",
        product_key_verified: true,
      },
      undefined,
      {
        id: "user-1",
        username: "owner",
        role: "admin",
        token: "existing-token",
      },
    );

    expect(user.token).toBe("existing-token");
    expect(user.product_key_verified).toBe(true);
  });
});
