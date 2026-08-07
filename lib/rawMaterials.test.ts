import {
  buildRawMaterialSummary,
  type RawMaterial,
  type RawMaterialMovement,
} from "./rawMaterials";

describe("buildRawMaterialSummary", () => {
  it("calculates balance from opening stock and movement history", () => {
    const rawMaterial: RawMaterial = {
      id: "rm-1",
      name: "Steel",
      code: "STL-001",
      category: "Metal",
      unitOfMeasure: "kg",
      currentStockBalance: 100,
      openingBalance: 100,
    };

    const movements: RawMaterialMovement[] = [
      {
        id: "m-1",
        rawMaterialId: "rm-1",
        movementType: "received",
        quantity: 40,
        reason: "Purchase",
      },
      {
        id: "m-2",
        rawMaterialId: "rm-1",
        movementType: "used",
        quantity: 25,
        reason: "Production",
      },
      {
        id: "m-3",
        rawMaterialId: "rm-1",
        movementType: "wasted",
        quantity: 5,
        reason: "Damage",
      },
    ];

    const summary = buildRawMaterialSummary(rawMaterial, movements);

    expect(summary.currentBalance).toBe(110);
    expect(summary.totalReceived).toBe(40);
    expect(summary.totalUsed).toBe(25);
    expect(summary.totalWasted).toBe(5);
  });

  it("marks stock as low when it falls below the minimum threshold", () => {
    const rawMaterial: RawMaterial = {
      id: "rm-2",
      name: "Glue",
      currentStockBalance: 4,
      openingBalance: 4,
      minimumStockLevel: 6,
      reorderLevel: 10,
    };

    const summary = buildRawMaterialSummary(rawMaterial, []);

    expect(summary.isLowStock).toBe(true);
    expect(summary.stockStatus).toBe("low");
  });
});
