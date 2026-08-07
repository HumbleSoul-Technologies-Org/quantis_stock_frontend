export interface RawMaterial {
  id?: string;
  _id?: string;
  name: string;
  code?: string;
  category?: string;
  description?: string;
  unitOfMeasure?: string;
  packagingUnit?: string;
  quantityPerPack?: number;
  subUnitSize?: number;
  totalEquivalentQuantity?: number;
  openingBalance?: number;
  currentStockBalance?: number;
  quantityReceived?: number;
  quantityUsed?: number;
  quantityWasted?: number;
  reorderLevel?: number;
  minimumStockLevel?: number;
  maximumStockLevel?: number;
  supplier?: string;
  purchasePrice?: number;
  currency?: string;
  storageLocation?: string;
  storageCondition?: string;
  expiryDate?: string;
  handlingNotes?: string;
  businessId?: string;
  branchId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawMaterialMovement {
  id?: string;
  _id?: string;
  rawMaterialId: string;
  movementType: "received" | "used" | "wasted" | "adjusted";
  quantity: number;
  reason?: string;
  reference?: string;
  notes?: string;
  businessId?: string;
  branchId?: string | null;
  createdBy?: string;
  createdAt?: string;
}

export interface RawMaterialSummary {
  currentBalance: number;
  totalReceived: number;
  totalUsed: number;
  totalWasted: number;
  isLowStock: boolean;
  stockStatus: "normal" | "low" | "reorder";
}

export function buildRawMaterialSummary(
  rawMaterial: RawMaterial,
  movements: RawMaterialMovement[] = [],
): RawMaterialSummary {
  const openingBalance = Number(rawMaterial.openingBalance ?? 0);
  const currentBalance = Number(
    rawMaterial.currentStockBalance ?? openingBalance,
  );
  const totalReceived = movements
    .filter((movement) => movement.movementType === "received")
    .reduce((sum, movement) => sum + Number(movement.quantity ?? 0), 0);
  const totalUsed = movements
    .filter((movement) => movement.movementType === "used")
    .reduce((sum, movement) => sum + Number(movement.quantity ?? 0), 0);
  const totalWasted = movements
    .filter((movement) => movement.movementType === "wasted")
    .reduce((sum, movement) => sum + Number(movement.quantity ?? 0), 0);

  const adjustedBalance =
    currentBalance + totalReceived - totalUsed - totalWasted;
  const minimumStockLevel = Number(rawMaterial.minimumStockLevel ?? 0);
  const reorderLevel = Number(rawMaterial.reorderLevel ?? 0);

  let stockStatus: RawMaterialSummary["stockStatus"] = "normal";
  if (minimumStockLevel > 0 && adjustedBalance <= minimumStockLevel) {
    stockStatus = "low";
  } else if (reorderLevel > 0 && adjustedBalance <= reorderLevel) {
    stockStatus = "reorder";
  }

  return {
    currentBalance: adjustedBalance,
    totalReceived,
    totalUsed,
    totalWasted,
    isLowStock: stockStatus !== "normal",
    stockStatus,
  };
}
