import { getSaleCreatorId } from "@/lib/salesUtils";

describe("getSaleCreatorId", () => {
  it("returns a string creator ID", () => {
    expect(getSaleCreatorId("user-1")).toBe("user-1");
  });

  it("returns the ID from a populated user", () => {
    expect(
      getSaleCreatorId({
        id: "user-1",
        username: "cashier",
        role: "sales",
      }),
    ).toBe("user-1");
  });

  it("supports populated users that only have a Mongo ID", () => {
    expect(
      getSaleCreatorId({
        id: "",
        _id: "user-1",
        username: "cashier",
        role: "sales",
      }),
    ).toBe("user-1");
  });
});
